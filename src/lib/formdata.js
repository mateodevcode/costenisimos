import "server-only";
import { HttpError } from "@/lib/api";

/** Texto de un FormData (undefined si no viene). */
export function texto(fd, campo) {
  const v = fd.get(campo);
  return typeof v === "string" ? v : undefined;
}

/** Campo JSON de un FormData (p. ej. listas). undefined si no viene. */
export function json(fd, campo) {
  const v = fd.get(campo);
  if (v === null || v === undefined || v === "") return undefined;
  if (typeof v !== "string") throw new HttpError(400, `El campo ${campo} no es válido.`);
  try {
    return JSON.parse(v);
  } catch {
    throw new HttpError(400, `El campo ${campo} no es JSON válido.`);
  }
}

/** "true"/"false" → boolean; undefined si no viene. */
export function booleano(fd, campo) {
  const v = fd.get(campo);
  if (v === null) return undefined;
  return v === "true" || v === "1" || v === "on";
}
