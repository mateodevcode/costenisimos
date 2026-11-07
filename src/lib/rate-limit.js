import "server-only";
import { connectDB } from "@/lib/db";
import { HttpError } from "@/lib/api";
import RateLimit from "@/models/RateLimit";

/**
 * Rate limit de ventana fija en Mongo (upsert + $inc, TTL en expiraEn).
 * Lanza HttpError 429 si se supera `limite` dentro de `ventanaSeg`.
 */
export async function rateLimit(key, limite, ventanaSeg, mensaje = "Demasiadas solicitudes. Intenta de nuevo en unos minutos.") {
  await connectDB();
  const ahora = new Date();

  let doc = await RateLimit.findOneAndUpdate(
    { key, expiraEn: { $gt: ahora } },
    { $inc: { count: 1 } },
    { returnDocument: "after" }
  ).lean();

  if (!doc) {
    try {
      doc = await RateLimit.findOneAndUpdate(
        { key },
        { $set: { count: 1, expiraEn: new Date(ahora.getTime() + ventanaSeg * 1000) } },
        { upsert: true, returnDocument: "after" }
      ).lean();
    } catch (err) {
      if (err?.code !== 11000) throw err;
      // Otra petición creó la clave en paralelo: sumamos sobre ella.
      doc = await RateLimit.findOneAndUpdate({ key }, { $inc: { count: 1 } }, { returnDocument: "after" }).lean();
    }
  }

  if (doc && doc.count > limite) {
    const restante = Math.max(1, Math.ceil((new Date(doc.expiraEn).getTime() - ahora.getTime()) / 1000));
    throw new HttpError(429, mensaje, { reintentarEn: restante });
  }
}

/** 60 mutaciones por minuto por usuario en el panel. */
export function rateLimitPanel(session) {
  return rateLimit(`panel:${session.id}`, 60, 60, "Demasiadas acciones seguidas. Espera un momento.");
}
