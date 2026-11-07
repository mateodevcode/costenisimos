import { connection } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { leerJson, ok, withErrors } from "@/lib/api";
import { requireRole } from "@/lib/auth/guard";
import { rateLimitPanel } from "@/lib/rate-limit";
import { getConfig } from "@/lib/config";
import { revalidarConfig } from "@/lib/catalogo";
import { VALIDADORES, patchSchema } from "@/lib/config-schemas";
import { registrar } from "@/lib/registro";
import { eliminarImagenes } from "@/lib/imagenes";
import { keyDesdeUrl } from "@/lib/s3";
import { CONFIG_DEFAULTS, ROLES_ADMIN } from "@/lib/constants";
import Configuracion from "@/models/Configuracion";

export const GET = withErrors(async () => {
  await connection();
  return ok(await getConfig());
});

/** Imágenes del sitio (logo y galería) que dejaron de usarse y viven en nuestro bucket. */
function imagenesRetiradas(antes, despues) {
  const usadas = (s) => [s?.logoUrl, ...(s?.nosotros?.imagenes || [])].filter(Boolean);
  const nuevas = new Set(usadas(despues));
  return usadas(antes)
    .filter((u) => !nuevas.has(u))
    .map((u) => {
      try {
        return keyDesdeUrl(u);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export const PATCH = withErrors(async (req) => {
  const session = await requireRole(req, ROLES_ADMIN);
  await rateLimitPanel(session);
  const { updates } = await leerJson(req, patchSchema);

  // Validar TODO antes de escribir.
  const validados = updates.map(({ key, value }) => {
    const r = VALIDADORES[key].safeParse(value);
    if (!r.success) throw new z.ZodError(r.error.issues.map((i) => ({ ...i, path: [key, ...i.path] })));
    return { key, value: r.data };
  });

  await connectDB();
  const resultado = {};
  for (const { key, value } of validados) {
    const previo = await Configuracion.findOne({ key }).lean();
    const antes = previo?.value ?? CONFIG_DEFAULTS[key];
    await Configuracion.updateOne({ key }, { $set: { value } }, { upsert: true });
    resultado[key] = value;

    if (JSON.stringify(antes) !== JSON.stringify(value)) {
      await registrar({
        sesion: session,
        accion: "cambiar_configuracion",
        entidad: "configuracion",
        entidadId: key,
        entidadNombre: key,
        antes: typeof antes === "object" && antes !== null ? antes : { valor: antes },
        despues: typeof value === "object" && value !== null ? value : { valor: value },
      });
    }
    if (key === "site") await eliminarImagenes(imagenesRetiradas(antes, value));
  }

  revalidarConfig();
  return ok(resultado, "Configuración guardada.");
});
