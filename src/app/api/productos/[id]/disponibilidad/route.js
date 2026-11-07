import { z } from "zod";
import { connectDB } from "@/lib/db";
import { HttpError, leerJson, ok, validarId, withErrors } from "@/lib/api";
import { requireRole } from "@/lib/auth/guard";
import { rateLimitPanel } from "@/lib/rate-limit";
import { revalidarCatalogo, serializarProducto } from "@/lib/catalogo";
import { registrar } from "@/lib/registro";
import { ROLES_PANEL } from "@/lib/constants";
import Producto from "@/models/Producto";

const schema = z.object({ disponibilidad: z.boolean({ error: "disponibilidad debe ser verdadero o falso." }) }).strict();

export const PATCH = withErrors(async (req, ctx) => {
  const session = await requireRole(req, ROLES_PANEL);
  await rateLimitPanel(session);
  const { id } = await ctx.params;
  validarId(id);
  const { disponibilidad } = await leerJson(req, schema);

  await connectDB();
  const antes = await Producto.findById(id).lean();
  if (!antes) throw new HttpError(404, "Producto no encontrado.");

  const producto = await Producto.findByIdAndUpdate(id, { $set: { disponibilidad } }, { returnDocument: "after" }).lean();

  if (antes.disponibilidad !== disponibilidad) {
    await registrar({
      sesion: session,
      accion: "cambiar_disponibilidad",
      entidad: "producto",
      antes: { _id: antes._id, nombre: antes.nombre, disponibilidad: antes.disponibilidad },
      despues: { _id: producto._id, nombre: producto.nombre, disponibilidad: producto.disponibilidad },
    });
    revalidarCatalogo();
  }
  return ok(serializarProducto(producto), disponibilidad ? "Producto disponible." : "Producto marcado como agotado.");
});
