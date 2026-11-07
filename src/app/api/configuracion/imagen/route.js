import { z } from "zod";
import { created, leerFormData, withErrors } from "@/lib/api";
import { requireRole } from "@/lib/auth/guard";
import { rateLimitPanel } from "@/lib/rate-limit";
import { MAX_LADO, leerArchivo, subirImagen } from "@/lib/imagenes";
import { texto } from "@/lib/formdata";
import { ROLES_ADMIN } from "@/lib/constants";

const tipoSchema = z.enum(["logo", "nosotros"], { error: "Tipo de imagen inválido." });

/**
 * Sube el logo o una imagen de la galería "Nosotros" y devuelve su URL.
 * La URL se guarda en `site` con PATCH /api/configuracion; al reemplazarla, la anterior se borra del bucket.
 */
export const POST = withErrors(async (req) => {
  const session = await requireRole(req, ROLES_ADMIN);
  await rateLimitPanel(session);
  const fd = await leerFormData(req);
  const tipo = tipoSchema.parse(texto(fd, "tipo"));
  const file = leerArchivo(fd, { requerido: true });

  const { url, publicId } = await subirImagen(file, {
    carpeta: "sitio",
    prefijo: tipo,
    nombre: tipo,
    maxLado: tipo === "logo" ? 512 : MAX_LADO.sitio,
  });
  return created({ url, publicId }, "Imagen subida.");
});
