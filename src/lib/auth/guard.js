import "server-only";
import { HttpError } from "@/lib/api";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { verifyAccess } from "@/lib/auth/tokens";

/**
 * Guard para route handlers. Lanza HttpError (401/403) que `withErrors` convierte en respuesta.
 * Devuelve la sesión { id, role, name, email, image }.
 */
export async function requireSession(req) {
  const session = await verifyAccess(req.cookies.get(ACCESS_COOKIE)?.value);
  if (!session) throw new HttpError(401, "Debes iniciar sesión.");
  return session;
}

export async function requireRole(req, roles) {
  const session = await requireSession(req);
  const permitidos = roles.map((r) => String(r).toLowerCase());
  if (!permitidos.includes(session.role)) {
    throw new HttpError(403, "No tienes permisos para realizar esta acción.");
  }
  return session;
}

export function tieneRol(session, roles) {
  return Boolean(session) && roles.map((r) => r.toLowerCase()).includes(String(session.role).toLowerCase());
}
