import { connection } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { HttpError, created, leerFormData, leerQuery, ok, validarId, withErrors, zId } from "@/lib/api";
import { requireRole } from "@/lib/auth/guard";
import { rateLimitPanel } from "@/lib/rate-limit";
import { MAX_LADO, eliminarImagen, leerArchivo, subirImagen } from "@/lib/imagenes";
import { getPromociones, revalidarPromociones, serializarPromocion } from "@/lib/promociones";
import { registrar } from "@/lib/registro";
import { booleano, texto } from "@/lib/formdata";
import { ROLES_ADMIN } from "@/lib/constants";
import { capitalizar, limpiarTexto } from "@/lib/utils";
import Promocion from "@/models/Promocion";

export const GET = withErrors(async (req) => {
  await requireRole(req, ROLES_ADMIN);
  await connection();
  return ok(await getPromociones());
});

const precioOpcional = z.number({ error: "El precio debe ser un número." }).finite().min(0, "El precio no puede ser negativo.").nullable();

const camposSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(80),
  descripcion: z.string().max(600, "La descripción es muy larga (máx. 600 caracteres)."),
  etiqueta: z.string().trim().max(24, "La etiqueta es muy larga (máx. 24 caracteres)."),
  precio: precioOpcional,
  precioAntes: precioOpcional,
  activa: z.boolean(),
  hasta: z.date().nullable(),
});

/** "" → null (sin precio); si no, número (igual que en productos). undefined si no viene. */
function leerPrecio(fd, campo) {
  const raw = texto(fd, campo);
  if (raw === undefined) return undefined;
  const limpio = raw.trim().replace(",", ".");
  if (!limpio) return null;
  const n = Number(limpio);
  if (Number.isNaN(n) || n < 0) throw new HttpError(400, "El precio debe ser un número mayor o igual a 0.");
  return n;
}

/** "AAAA-MM-DD" → fin de ese día en hora de Colombia; "" → null (sin vencimiento). */
function leerHasta(fd) {
  const raw = texto(fd, "hasta");
  if (raw === undefined) return undefined;
  if (!raw.trim()) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) throw new HttpError(400, "La fecha de vencimiento no es válida.");
  const d = new Date(`${raw.trim()}T23:59:59-05:00`);
  if (Number.isNaN(d.getTime())) throw new HttpError(400, "La fecha de vencimiento no es válida.");
  return d;
}

function leerCampos(fd, { parcial }) {
  const crudo = {
    nombre: texto(fd, "nombre"),
    descripcion: texto(fd, "descripcion"),
    etiqueta: texto(fd, "etiqueta"),
    precio: leerPrecio(fd, "precio"),
    precioAntes: leerPrecio(fd, "precioAntes"),
    activa: booleano(fd, "activa"),
    hasta: leerHasta(fd),
  };
  const limpio = Object.fromEntries(Object.entries(crudo).filter(([, v]) => v !== undefined));
  const schema = parcial
    ? camposSchema.partial()
    : camposSchema.partial({ descripcion: true, etiqueta: true, precio: true, precioAntes: true, activa: true, hasta: true });
  const datos = schema.parse(limpio);
  if (datos.nombre !== undefined) datos.nombre = capitalizar(datos.nombre);
  if (datos.descripcion !== undefined) datos.descripcion = limpiarTexto(datos.descripcion);
  return datos;
}

export const POST = withErrors(async (req) => {
  const session = await requireRole(req, ROLES_ADMIN);
  await rateLimitPanel(session);
  const fd = await leerFormData(req);

  const datos = leerCampos(fd, { parcial: false });
  const file = leerArchivo(fd, { requerido: true });
  await connectDB();

  const img = await subirImagen(file, { carpeta: "promociones", prefijo: "promo", nombre: datos.nombre, maxLado: MAX_LADO.promociones });

  let promo;
  try {
    const ultima = await Promocion.findOne({}).sort({ position: -1 }).select("position").lean();
    promo = await Promocion.create({ ...datos, imagen: img.url, publicId: img.publicId, position: (ultima?.position ?? -1) + 1 });
  } catch (err) {
    await eliminarImagen(img.publicId);
    throw err;
  }

  await registrar({ sesion: session, accion: "crear", entidad: "promocion", despues: promo });
  revalidarPromociones();
  return created(serializarPromocion(promo), "Promoción creada.");
});

export const PUT = withErrors(async (req) => {
  const session = await requireRole(req, ROLES_ADMIN);
  await rateLimitPanel(session);
  const fd = await leerFormData(req);

  const id = validarId(texto(fd, "id"));
  const datos = leerCampos(fd, { parcial: true });
  const file = leerArchivo(fd);

  await connectDB();
  const promo = await Promocion.findById(id);
  if (!promo) throw new HttpError(404, "Promoción no encontrada.");
  const antes = promo.toObject();

  let nueva = null;
  if (file) {
    nueva = await subirImagen(file, { carpeta: "promociones", prefijo: "promo", nombre: datos.nombre || promo.nombre, maxLado: MAX_LADO.promociones });
  }

  promo.set(datos);
  if (nueva) {
    promo.imagen = nueva.url;
    promo.publicId = nueva.publicId;
  }
  try {
    await promo.save();
  } catch (err) {
    if (nueva) await eliminarImagen(nueva.publicId);
    throw err;
  }
  if (nueva) await eliminarImagen(antes.publicId);

  await registrar({ sesion: session, accion: "editar", entidad: "promocion", antes, despues: promo });
  revalidarPromociones();
  return ok(serializarPromocion(promo), "Promoción actualizada.");
});

const deleteSchema = z.object({ id: zId });

export const DELETE = withErrors(async (req) => {
  const session = await requireRole(req, ROLES_ADMIN);
  await rateLimitPanel(session);
  const { id } = leerQuery(req, deleteSchema);

  await connectDB();
  const promo = await Promocion.findById(id).lean();
  if (!promo) throw new HttpError(404, "Promoción no encontrada.");

  await Promocion.deleteOne({ _id: id });
  await eliminarImagen(promo.publicId);

  await registrar({ sesion: session, accion: "eliminar", entidad: "promocion", antes: promo });
  revalidarPromociones();
  return ok(null, "Promoción eliminada.");
});
