import { connection } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { HttpError, created, leerFormData, leerQuery, ok, validarId, withErrors, zId } from "@/lib/api";
import { requireRole } from "@/lib/auth/guard";
import { rateLimitPanel } from "@/lib/rate-limit";
import { MAX_LADO, eliminarImagen, leerArchivo, subirImagen } from "@/lib/imagenes";
import { getCatalogo, revalidarCatalogo, serializarIngrediente } from "@/lib/catalogo";
import { registrar } from "@/lib/registro";
import { texto } from "@/lib/formdata";
import { ROLES_ADMIN } from "@/lib/constants";
import { capitalizar } from "@/lib/utils";
import Ingrediente from "@/models/Ingrediente";
import Producto from "@/models/Producto";

export const GET = withErrors(async () => {
  await connection(); // datos en runtime (no en build)
  const { ingredientes } = await getCatalogo();
  return ok(ingredientes);
});

const nombreSchema = z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(60);
const cantidadSchema = z.string().trim().max(40, "La cantidad es muy larga.");

export const POST = withErrors(async (req) => {
  const session = await requireRole(req, ROLES_ADMIN);
  await rateLimitPanel(session);
  const fd = await leerFormData(req);

  const nombre = capitalizar(nombreSchema.parse(texto(fd, "nombre") ?? ""));
  const cantidad = cantidadSchema.parse(texto(fd, "cantidad") ?? "");
  const productoIdRaw = texto(fd, "productoId");
  const productoId = productoIdRaw ? validarId(productoIdRaw, "producto") : null;
  const file = leerArchivo(fd, { requerido: true });

  await connectDB();
  const producto = productoId ? await Producto.findById(productoId) : null;
  if (productoId && !producto) throw new HttpError(400, "El producto seleccionado no existe.");

  const img = await subirImagen(file, { carpeta: "ingredientes", prefijo: "ing", nombre, maxLado: MAX_LADO.ingredientes });

  let ingrediente;
  try {
    ingrediente = await Ingrediente.create({ nombre, cantidad, imagen: img.url, publicId: img.publicId });
  } catch (err) {
    await eliminarImagen(img.publicId);
    throw err;
  }

  await registrar({ sesion: session, accion: "crear", entidad: "ingrediente", despues: ingrediente });

  // Asociación opcional a un producto al crear.
  if (producto) {
    const antes = producto.toObject();
    await Producto.updateOne({ _id: producto._id }, { $addToSet: { ingredientes: ingrediente._id } });
    const despues = await Producto.findById(producto._id).lean();
    await registrar({ sesion: session, accion: "editar", entidad: "producto", antes, despues });
  }

  revalidarCatalogo();
  return created(serializarIngrediente(ingrediente), producto ? `Ingrediente creado y asociado a ${producto.nombre}.` : "Ingrediente creado.");
});

export const PUT = withErrors(async (req) => {
  const session = await requireRole(req, ROLES_ADMIN);
  await rateLimitPanel(session);
  const fd = await leerFormData(req);

  const id = validarId(texto(fd, "id"));
  const nombreRaw = texto(fd, "nombre");
  const cantidadRaw = texto(fd, "cantidad");
  const file = leerArchivo(fd);

  await connectDB();
  const ingrediente = await Ingrediente.findById(id);
  if (!ingrediente) throw new HttpError(404, "Ingrediente no encontrado.");
  const antes = ingrediente.toObject();

  if (nombreRaw !== undefined) ingrediente.nombre = capitalizar(nombreSchema.parse(nombreRaw));
  if (cantidadRaw !== undefined) ingrediente.cantidad = cantidadSchema.parse(cantidadRaw);

  let nueva = null;
  if (file) {
    nueva = await subirImagen(file, { carpeta: "ingredientes", prefijo: "ing", nombre: ingrediente.nombre, maxLado: MAX_LADO.ingredientes });
    ingrediente.imagen = nueva.url;
    ingrediente.publicId = nueva.publicId;
  }
  try {
    await ingrediente.save();
  } catch (err) {
    if (nueva) await eliminarImagen(nueva.publicId);
    throw err;
  }
  if (nueva) await eliminarImagen(antes.publicId);

  await registrar({ sesion: session, accion: "editar", entidad: "ingrediente", antes, despues: ingrediente });
  revalidarCatalogo();
  return ok(serializarIngrediente(ingrediente), "Ingrediente actualizado.");
});

const deleteSchema = z.object({ id: zId });

/** Borra el ingrediente, lo quita de los productos ($pull) y elimina su imagen. */
export const DELETE = withErrors(async (req) => {
  const session = await requireRole(req, ROLES_ADMIN);
  await rateLimitPanel(session);
  const { id } = leerQuery(req, deleteSchema);

  await connectDB();
  const ingrediente = await Ingrediente.findById(id).lean();
  if (!ingrediente) throw new HttpError(404, "Ingrediente no encontrado.");

  const { modifiedCount } = await Producto.updateMany({ ingredientes: id }, { $pull: { ingredientes: id } });
  await Ingrediente.deleteOne({ _id: id });
  await eliminarImagen(ingrediente.publicId);

  await registrar({ sesion: session, accion: "eliminar", entidad: "ingrediente", antes: { ...ingrediente, productosAfectados: modifiedCount } });
  revalidarCatalogo();
  return ok({ productosAfectados: modifiedCount }, "Ingrediente eliminado.");
});
