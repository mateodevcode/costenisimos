import { ArrowDownUp, Boxes, ClipboardList, LayoutGrid, Settings, ToggleRight, Users } from "lucide-react";
import { ROLES_ADMIN, ROLES_PANEL } from "@/lib/constants";

/** Vistas del panel y roles que las ven. Los endpoints imponen los mismos permisos. */
export const NAV_MASTER = [
  { href: "/master/disponibilidad", titulo: "Disponibilidad", icono: ToggleRight, roles: ROLES_PANEL },
  { href: "/master/catalogo", titulo: "Catálogo", icono: LayoutGrid, roles: ROLES_ADMIN },
  { href: "/master/ordenar-categorias", titulo: "Ordenar categorías", icono: ArrowDownUp, roles: ROLES_ADMIN },
  // Nombre heredado a propósito: la ruta es /master/buscar pero el menú la llama "Inventario".
  { href: "/master/buscar", titulo: "Inventario", icono: Boxes, roles: ROLES_PANEL },
  { href: "/master/usuarios", titulo: "Usuarios", icono: Users, roles: ROLES_ADMIN },
  { href: "/master/registros", titulo: "Registros", icono: ClipboardList, roles: ROLES_ADMIN },
  { href: "/master/configuracion", titulo: "Configuración", icono: Settings, roles: ROLES_ADMIN },
];

export function navParaRol(role) {
  return NAV_MASTER.filter((n) => n.roles.includes(role));
}
