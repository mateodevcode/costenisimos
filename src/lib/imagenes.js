import "server-only";
import sharp from "sharp";
import { HttpError } from "@/lib/api";
import { env } from "@/lib/env";
import { eliminarObjeto, subirObjeto } from "@/lib/s3";
import { slugify } from "@/lib/utils";

export const MAX_BYTES = 10 * 1024 * 1024;
export const MAX_LADO = { productos: 1280, categorias: 1280, ingredientes: 800, sitio: 1600 };

const EXTENSIONES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

/**
 * Valida el campo `file` de un FormData. Devuelve el File o null si no viene.
 * @param {FormData} fd
 * @param {{ requerido?: boolean }} opts
 */
export function leerArchivo(fd, { requerido = false } = {}) {
  const file = fd.get("file");
  const presente = file && typeof file === "object" && typeof file.arrayBuffer === "function" && file.size > 0;
  if (!presente) {
    if (requerido) throw new HttpError(400, "La imagen es obligatoria.");
    return null;
  }
  if (!String(file.type || "").startsWith("image/")) throw new HttpError(400, "El archivo debe ser una imagen.");
  // SVG puede contener scripts: no se aceptan.
  if (file.type === "image/svg+xml") throw new HttpError(400, "Formato no permitido. Usa JPG, PNG, WebP, GIF o AVIF.");
  if (file.size > MAX_BYTES) throw new HttpError(413, "La imagen supera el límite de 10 MB.");
  return file;
}

/**
 * Optimiza con sharp (rotación EXIF, máx. maxLado, WebP 80) y sube a S3.
 * Si sharp falla, sube el original.
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export async function subirImagen(fileOrBuffer, { carpeta, prefijo, nombre, maxLado = 1280 }) {
  const original = Buffer.isBuffer(fileOrBuffer) ? fileOrBuffer : Buffer.from(await fileOrBuffer.arrayBuffer());
  const tipoOriginal = Buffer.isBuffer(fileOrBuffer) ? "application/octet-stream" : fileOrBuffer.type;

  let body = original;
  let contentType = tipoOriginal;
  let ext = EXTENSIONES[tipoOriginal] || "bin";

  if (tipoOriginal !== "image/svg+xml") {
    try {
      body = await sharp(original)
        .rotate()
        .resize({ width: maxLado, height: maxLado, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      contentType = "image/webp";
      ext = "webp";
    } catch (err) {
      console.warn("[imagenes] sharp falló, se sube el original:", err?.message);
    }
  }

  const base = slugify(nombre || "imagen").slice(0, 60) || "imagen";
  const key = `${env.storage.carpeta}/${carpeta}/${prefijo}_${base}_${Date.now()}.${ext}`;
  const { url } = await subirObjeto({ key, body, contentType });
  return { url, publicId: key };
}

/** Borra una imagen; nunca lanza (solo console.warn). */
export async function eliminarImagen(publicId) {
  if (!publicId) return;
  try {
    await eliminarObjeto(publicId);
  } catch (err) {
    console.warn(`[imagenes] No se pudo eliminar ${publicId}:`, err?.message);
  }
}

export async function eliminarImagenes(publicIds = []) {
  await Promise.all([...new Set(publicIds.filter(Boolean))].map(eliminarImagen));
}
