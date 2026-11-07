import "server-only";
import bcrypt from "bcryptjs";
import { BCRYPT_ROUNDS } from "@/lib/auth/password";

export function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function compararPassword(password, hash) {
  if (!hash) return Promise.resolve(false);
  return bcrypt.compare(password, hash);
}

let hashFicticio;

/** Hace una comparación bcrypt "en vacío" para que el tiempo de respuesta no revele si un correo existe. */
export async function compararPasswordFicticia(password) {
  hashFicticio ??= bcrypt.hash("comparacion-ficticia", BCRYPT_ROUNDS);
  await bcrypt.compare(String(password), await hashFicticio);
  return false;
}
