import { connection } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { HttpError, created, leerFormData, leerQuery, ok, validarId, withErrors, zId } from "@/lib/api";
import { requireRole } from "@/lib/auth/guard";
import { rateLimitPanel } from "@/lib/rate-limit";
import { MAX_LADO, eliminarImagen, eliminarImagenes, leerArchivo, subirImagen } from "@/lib/imagenes";
import { getCatalogo, revalidarCatalogo, serializarCategoria } from "@/lib/catalogo";
import { registrar } from "@/lib/registro";
import { texto } from "@/lib/formdata";
import { ROLES_ADMIN } from "@/lib/constants";
import { capitalizar, slugify } from "@/lib/utils";
import Categoria from "@/models/Categoria";
import Producto from "@/models/Producto";
import Ingrediente from "@/models/Ingrediente";

const nombreSchema = z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(60);

export const GET = withErrors(async () => {
  await connection(); // datos en runtime (no en build)
  const { categorias } = await getCatalogo();
  return ok(categorias);
});

async function validarSlugLibre(slug, excluirId) {
  if (!slug) throw new HttpError(400, "El nombre no es válido.");
  const filtro = excluirId ? { slug, _id: { $ne: excluirId } } : { slug };
  if (await Categoria.exists(filtro)) throw new HttpError(409, "Ya existe una categoría con ese nombre.");
}

export const POST = withErrors(async (req) => {
  const session = await requireRole(req, ROLES_ADMIN);
  await rateLimitPanel(session);
  const fd = await leerFormData(req);

  // 1. Validar todo
  const nombre = capitalizar(nombreSchema.parse(texto(fd, "nombre") ?? ""));
  const slug = slugify(nombre);
  const file = leerArchivo(fd, { requerido: true });
  await connectDB();
  await validarSlugLibre(slug);

  // 2. Subir imagen
  const img = await subirImagen(file, { carpeta: "categorias", prefijo: "cat", nombre, maxLado: MAX_LADO.categorias });

  // 3. Guardar (si falla, borrar la imagen recién subida)
  let categoria;
  try {
    const ultima = await Categoria.findOne({}).sort({ position: -1 }).select("position").lean();
    categoria = await Categoria.create({
      nombre,
      slug,
      imagen: img.url,
      publicId: img.publicId,
      position: (ultima?.position ?? -1) + 1,
    });
  } catch (err) {
    await eliminarImagen(img.publicId);
    if (err?.code === 11000) throw new HttpError(409, "Ya existe una categoría con ese nombre.");
    throw err;
  }

  await registrar({ sesion: session, accion: "crear", entidad: "categoria", despues: categoria });
  revalidarCatalogo();
  return created(serializarCategoria(categoria), "Categoría creada.");
});

export const PUT = withErrors(async (req) => {
  const session = await requireRole(req, ROLES_ADMIN);
  await rateLimitPanel(session);
  const fd = await leerFormData(req);

  const id = validarId(texto(fd, "id"));
  const nombreRaw = texto(fd, "nombre");
  const nombre = nombreRaw !== undefined ? capitalizar(nombreSchema.parse(nombreRaw)) : undefined;
  const file = leerArchivo(fd);

  await connectDB();
  const categoria = await Categoria.findById(id);
  if (!categoria) throw new HttpError(404, "Categoría no encontrada.");
  const antes = categoria.toObject();

  if (nombre !== undefined && nombre !== categoria.nombre) {
    const slug = slugify(nombre);
    await validarSlugLibre(slug, id);
    categoria.nombre = nombre;
    categoria.slug = slug;
  }

  let nueva = null;
  if (file) {
    nueva = await subirImagen(file, { carpeta: "categorias", prefijo: "cat", nombre: categoria.nombre, maxLado: MAX_LADO.categorias });
    categoria.imagen = nueva.url;
    categoria.publicId = nueva.publicId;
  }

  try {
    await categoria.save();
  } catch (err) {
    if (nueva) await eliminarImagen(nueva.publicId);
    if (err?.code === 11000) throw new HttpError(409, "Ya existe una categoría con ese nombre.");
    throw err;
  }
  if (nueva && antes.publicId !== nueva.publicId) await eliminarImagen(antes.publicId);

  await registrar({ sesion: session, accion: "editar", entidad: "categoria", antes, despues: categoria });
  revalidarCatalogo();
  return ok(serializarCategoria(categoria), "Categoría actualizada.");
});

const deleteSchema = z.object({ id: zId });

/** Borra la categoría, sus productos, los ingredientes que queden sin uso y todas sus imágenes. */
export const DELETE = withErrors(async (req) => {
  const session = await requireRole(req, ROLES_ADMIN);
  await rateLimitPanel(session);
  const { id } = leerQuery(req, deleteSchema);

  await connectDB();
  const categoria = await Categoria.findById(id).lean();
  if (!categoria) throw new HttpError(404, "Categoría no encontrada.");

  const productos = await Producto.find({ categoria: id }).lean();
  const idsProductos = productos.map((p) => p._id);
  const idsIngredientes = [...new Set(productos.flatMap((p) => (p.ingredientes || []).map(String)))];

  await Producto.deleteMany({ categoria: id });
  await Categoria.deleteOne({ _id: id });

  // Ingredientes que ya no usa ningún producto restante.
  const enUso = idsIngredientes.length
    ? new Set((await Producto.distinct("ingredientes", { ingredientes: { $in: idsIngredientes } })).map(String))
    : new Set();
  const huerfanos = idsIngredientes.length
    ? await Ingrediente.find({ _id: { $in: idsIngredientes.filter((i) => !enUso.has(i)) } }).lean()
    : [];
  if (huerfanos.length) await Ingrediente.deleteMany({ _id: { $in: huerfanos.map((i) => i._id) } });

  await eliminarImagenes([categoria.publicId, ...productos.map((p) => p.publicId), ...huerfanos.map((i) => i.publicId)]);

  await registrar({
    sesion: session,
    accion: "eliminar",
    entidad: "categoria",
    antes: { ...categoria, productosEliminados: productos.map((p) => p.nombre), ingredientesEliminados: huerfanos.map((i) => i.nombre) },
  });
  revalidarCatalogo();
  return ok(
    { productos: idsProductos.length, ingredientes: huerfanos.length },
    `Categoría eliminada junto con ${idsProductos.length} producto(s) y ${huerfanos.length} ingrediente(s).`
  );
});
