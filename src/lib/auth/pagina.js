import "server-only";
import { redirect } from "next/navigation";
import { getSession, getUsuarioActual } from "@/lib/auth/session";
import { ROLES_PANEL } from "@/lib/constants";

/**
 * Guard del panel (Server Components). Verifica con BD: existe, no bloqueado y rol con acceso.
 * Devuelve el usuario (lean, sin password).
 */
export async function requerirPanel(destino = "/master") {
  const session = await getSession();
  if (!session) redirect(`/?login=1&callbackUrl=${encodeURIComponent(destino)}`);
  const usuario = await getUsuarioActual();
  if (!usuario || usuario.bloqueado) redirect("/");
  const role = String(usuario.role).toLowerCase();
  if (!ROLES_PANEL.includes(role)) redirect("/");
  return { ...usuario, role };
}

/** Guard por rol para una vista concreta del panel. Sin permiso → vuelve a Disponibilidad. */
export async function requerirRolPagina(roles) {
  const usuario = await requerirPanel();
  if (!roles.includes(usuario.role)) redirect("/master/disponibilidad");
  return usuario;
}
