import { z } from "zod";
import { connectDB } from "@/lib/db";
import { HttpError, leerQuery, ok, withErrors } from "@/lib/api";
import { requireRole } from "@/lib/auth/guard";
import { ROLES_ADMIN } from "@/lib/constants";
import Registro, { ACCIONES, ENTIDADES } from "@/models/Registro";

const fecha = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (usa AAAA-MM-DD).")
  .optional();

const schema = z.object({
  entidad: z.enum(ENTIDADES).optional(),
  accion: z.enum(ACCIONES).optional(),
  desde: fecha,
  hasta: fecha,
  limite: z.coerce.number().int().min(1).max(500).default(200),
});

export const GET = withErrors(async (req) => {
  await requireRole(req, ROLES_ADMIN);
  const { entidad, accion, desde, hasta, limite } = leerQuery(req, schema);

  const filtro = {};
  if (entidad) filtro.entidad = entidad;
  if (accion) filtro.accion = accion;
  if (desde || hasta) {
    filtro.fecha = {};
    // Fechas en hora de Colombia (UTC-5) para que "hasta" incluya todo el día.
    if (desde) filtro.fecha.$gte = new Date(`${desde}T00:00:00-05:00`);
    if (hasta) filtro.fecha.$lte = new Date(`${hasta}T23:59:59.999-05:00`);
    if (desde && hasta && filtro.fecha.$gte > filtro.fecha.$lte) throw new HttpError(400, "El rango de fechas no es válido.");
  }

  await connectDB();
  const registros = await Registro.find(filtro).sort({ fecha: -1 }).limit(limite).lean();
  return ok(
    registros.map((r) => ({
      id: String(r._id),
      usuario: r.usuario || null,
      accion: r.accion,
      entidad: r.entidad,
      entidadId: r.entidadId || null,
      entidadNombre: r.entidadNombre || "",
      cambios: r.cambios || [],
      datosAntes: r.datosAntes ?? null,
      datosDespues: r.datosDespues ?? null,
      fecha: new Date(r.fecha).toISOString(),
    }))
  );
});
