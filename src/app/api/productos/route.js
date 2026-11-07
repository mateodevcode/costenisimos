import { connection } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { HttpError, created, leerFormData, leerQuery, ok, validarId, withErrors, zId } from "@/lib/api";
import { requireRole } from "@/lib/auth/guard";
import { rateLimitPanel } from "@/lib/rate-limit";
import { MAX_LADO, eliminarImagen, eliminarImagenes, leerArchivo, subirImagen } from "@/lib/imagenes";
import { getCatalogo, revalidarCatalogo, serializarProducto } from "@/lib/catalogo";
import { registrar } from "@/lib/registro";
import { booleano, json, texto } from "@/lib/formdata";
import { MENU_IDS, ROLES_ADMIN } from "@/lib/constants";
import { capitalizar, limpiarTexto } from "@/lib/utils";
import Categoria from "@/models/Categoria";
import Producto from "@/models/Producto";
import Ingrediente from "@/models/Ingrediente";

export const GET = withErrors(async () => {
  await connection(); // datos en runtime (no en build)
  const { productos } = await getCatalogo();
  return ok(productos);
});

const camposSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(80),
  precio: z.number({ error: "El precio debe ser un número." }).finite().min(0, "El precio no puede ser negativo."),
  categoria: zId,
  descripcion: z.string().max(600, "La descripción es muy larga (máx. 600 caracteres)."),
  ingredientes: z.array(zId).max(100).transform((ids) => [...new Set(ids)]),
  disponibilidad: z.boolean(),
  menus: z
    .array(z.enum(MENU_IDS, { error: "Tipo de menú inválido." }))
    .max(MENU_IDS.length)
    .transform((m) => [...new Set(m)]),
});

/** Lee los campos del FormData; en edición todos son opcionales. */
function leerCampos(fd, { parcial }) {
  const precioRaw = texto(fd, "precio");
  let precio;
  if (precioRaw !== undefined) {
    precio = parseFloat(String(precioRaw).replace(",", "."));
    if (Number.isNaN(precio) || precio < 0) throw new HttpError(400, "El precio debe ser un número mayor o igual a 0.");
  }
  const crudo = {
    nombre: texto(fd, "nombre"),
    precio,
    categoria: texto(fd, "categoria"),
    descripcion: texto(fd, "descripcion"),
    ingredientes: json(fd, "ingredientes"),
    disponibilidad: booleano(fd, "disponibilidad"),
    menus: json(fd, "menus"),
  };
  const limpio = Object.fromEntries(Object.entries(crudo).filter(([, v]) => v !== undefined));
  const schema = parcial ? camposSchema.partial() : camposSchema.partial({ descripcion: true, ingredientes: true, disponibilidad: true, menus: true });
  const datos = schema.parse(limpio);
  if (datos.nombre !== undefined) datos.nombre = capitalizar(datos.nombre);
  if (datos.descripcion !== undefined) datos.descripcion = limpiarTexto(datos.descripcion);
  return datos;
}

async function validarReferencias({ categoria, ingredientes }) {
  if (categoria !== undefined && !(await Categoria.exists({ _id: categoria }))) {
    throw new HttpError(400, "La categoría seleccionada no existe.");
  }
  if (ingredientes?.length) {
    const n = await Ingrediente.countDocuments({ _id: { $in: ingredientes } });
    if (n !== ingredientes.length) throw new HttpError(400, "Alguno de los ingredientes no existe.");
  }
}

export const POST = withErrors(async (req) => {
  const session = await requireRole(req, ROLES_ADMIN);
  await rateLimitPanel(session);
  const fd = await leerFormData(req);

  const datos = leerCampos(fd, { parcial: false });
  const file = leerArchivo(fd, { requerido: true });
  await connectDB();
  await validarReferencias(datos);

  const img = await subirImagen(file, { carpeta: "productos", prefijo: "prod", nombre: datos.nombre, maxLado: MAX_LADO.productos });

  let producto;
  try {
    producto = await Producto.create({ ...datos, image: img.url, publicId: img.publicId });
  } catch (err) {
    await eliminarImagen(img.publicId);
    throw err;
  }

  await registrar({ sesion: session, accion: "crear", entidad: "producto", despues: producto });
  revalidarCatalogo();
  return created(serializarProducto(producto), "Producto creado.");
});

export const PUT = withErrors(async (req) => {
  const session = await requireRole(req, ROLES_ADMIN);
  await rateLimitPanel(session);
  const fd = await leerFormData(req);

  const id = validarId(texto(fd, "id"));
  const datos = leerCampos(fd, { parcial: true });
  const file = leerArchivo(fd);

  await connectDB();
  const producto = await Producto.findById(id);
  if (!producto) throw new HttpError(404, "Producto no encontrado.");
  await validarReferencias(datos);
  const antes = producto.toObject();

  let nueva = null;
  if (file) {
    nueva = await subirImagen(file, { carpeta: "productos", prefijo: "prod", nombre: datos.nombre || producto.nombre, maxLado: MAX_LADO.productos });
  }

  producto.set(datos);
  if (nueva) {
    producto.image = nueva.url;
    producto.publicId = nueva.publicId;
  }
  try {
    await producto.save();
  } catch (err) {
    if (nueva) await eliminarImagen(nueva.publicId);
    throw err;
  }
  if (nueva) await eliminarImagen(antes.publicId);

  await registrar({ sesion: session, accion: "editar", entidad: "producto", antes, despues: producto });
  revalidarCatalogo();
  return ok(serializarProducto(producto), "Producto actualizado.");
});

const deleteSchema = z.object({ id: zId });

/** Borra el producto, su imagen y los ingredientes que solo él usaba. */
export const DELETE = withErrors(async (req) => {
  const session = await requireRole(req, ROLES_ADMIN);
  await rateLimitPanel(session);
  const { id } = leerQuery(req, deleteSchema);

  await connectDB();
  const producto = await Producto.findById(id).lean();
  if (!producto) throw new HttpError(404, "Producto no encontrado.");

  await Producto.deleteOne({ _id: id });

  const propios = (producto.ingredientes || []).map(String);
  let huerfanos = [];
  if (propios.length) {
    const enUso = new Set(
      (await Producto.distinct("ingredientes", { ingredientes: { $in: propios.map((i) => new mongoose.Types.ObjectId(i)) } })).map(String)
    );
    huerfanos = await Ingrediente.find({ _id: { $in: propios.filter((i) => !enUso.has(i)) } }).lean();
    if (huerfanos.length) await Ingrediente.deleteMany({ _id: { $in: huerfanos.map((i) => i._id) } });
  }

  await eliminarImagenes([producto.publicId, ...huerfanos.map((i) => i.publicId)]);

  await registrar({
    sesion: session,
    accion: "eliminar",
    entidad: "producto",
    antes: { ...producto, ingredientesEliminados: huerfanos.map((i) => i.nombre) },
  });
  revalidarCatalogo();
  return ok({ ingredientes: huerfanos.length }, huerfanos.length ? `Producto eliminado junto con ${huerfanos.length} ingrediente(s) sin uso.` : "Producto eliminado.");
});
