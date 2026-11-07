import { z } from "zod";
import { connectDB } from "@/lib/db";
import { HttpError, leerJson, ok, withErrors, zId } from "@/lib/api";
import { requireRole } from "@/lib/auth/guard";
import { rateLimitPanel } from "@/lib/rate-limit";
import { revalidarCatalogo } from "@/lib/catalogo";
import { registrar } from "@/lib/registro";
import { ROLES_ADMIN } from "@/lib/constants";
import Categoria from "@/models/Categoria";

const schema = z.object({
  orden: z
    .array(zId)
    .min(1, "Debes enviar al menos una categoría.")
    .max(500)
    .refine((ids) => new Set(ids).size === ids.length, "Hay categorías repetidas."),
});

/** Recibe los ids en el orden deseado y guarda `position` en lote. */
export const PUT = withErrors(async (req) => {
  const session = await requireRole(req, ROLES_ADMIN);
  await rateLimitPanel(session);
  const { orden } = await leerJson(req, schema);

  await connectDB();
  const actuales = await Categoria.find({}).sort({ position: 1 }).select("nombre position").lean();
  if (actuales.length !== orden.length || !actuales.every((c) => orden.includes(String(c._id)))) {
    throw new HttpError(409, "La lista de categorías cambió. Recarga la página e intenta de nuevo.");
  }

  await Categoria.bulkWrite(
    orden.map((id, position) => ({ updateOne: { filter: { _id: id }, update: { $set: { position } } } }))
  );

  const nombre = new Map(actuales.map((c) => [String(c._id), c.nombre]));
  await registrar({
    sesion: session,
    accion: "reordenar",
    entidad: "categoria",
    entidadNombre: "Orden de categorías",
    antes: { orden: actuales.map((c) => c.nombre) },
    despues: { orden: orden.map((id) => nombre.get(id)) },
  });
  revalidarCatalogo();
  return ok(null, "Orden guardado.");
});
