// Piezas compartidas por los temas de inicio (server components, solo props).

import { MENU_TIPOS } from "@/lib/constants";

const CLAVES = { desayuno: "menuDesayuno", dia: "menuDia", noche: "menuNoche" };

/** Lista de horarios configurados en menu_info. */
export function horarios(menuInfo) {
  const lista = MENU_TIPOS.map((m) => ({ id: m.id, nombre: m.nombre, valor: menuInfo?.[CLAVES[m.id]] || "" })).filter((h) => h.valor);
  return lista;
}

export function telefonoHref(tel = "") {
  return `tel:${String(tel).replace(/[^\d+]/g, "")}`;
}
