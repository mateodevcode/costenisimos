// Constantes compartidas cliente/servidor. Sin imports para poder usarse también desde scripts/.

export const ROLES = ["usuario", "empleado", "admin", "superadmin"];
export const ROLES_PANEL = ["empleado", "admin", "superadmin"];
export const ROLES_ADMIN = ["admin", "superadmin"];

/** Tipos de menú del restaurante. Editable por restaurante. */
export const MENU_TIPOS = [
  { id: "desayuno", nombre: "Desayuno", desde: 6, hasta: 11 },
  { id: "dia", nombre: "Día", desde: 11, hasta: 17 },
  { id: "noche", nombre: "Noche", desde: 17, hasta: 24 },
];
export const MENU_IDS = MENU_TIPOS.map((m) => m.id);

export const CONFIG_KEYS = ["home_theme", "menu_theme", "menu_info", "site"];

export const ZONA_HORARIA_DEFAULT = "America/Bogota";
export const MONEDA_DEFAULT = "COP";

/** Hora actual (0-23) en la zona horaria del restaurante. */
export function horaEnZona(zonaHoraria = ZONA_HORARIA_DEFAULT, fecha = new Date()) {
  try {
    const partes = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: zonaHoraria,
    }).formatToParts(fecha);
    return Number(partes.find((p) => p.type === "hour")?.value ?? fecha.getHours());
  } catch {
    return fecha.getHours();
  }
}

/** Devuelve el id del menú que corresponde a la hora actual en la zona horaria dada. */
export function menuPorHora(zonaHoraria = ZONA_HORARIA_DEFAULT, fecha = new Date()) {
  const hora = horaEnZona(zonaHoraria, fecha);
  const menu = MENU_TIPOS.find((m) => hora >= m.desde && hora < m.hasta);
  return menu ? menu.id : MENU_TIPOS[0].id;
}

/** ¿El producto pertenece al menú? "todos" o productos sin menús asignados siempre aplican. */
export function perteneceAMenu(producto, menu) {
  if (!menu || menu === "todos") return true;
  const menus = Array.isArray(producto?.menus) ? producto.menus : [];
  if (menus.length === 0) return true;
  return menus.includes(menu);
}

export const SITE_DEFAULT = {
  nombre: "Restaurante",
  slogan: "",
  descripcion: "",
  telefono: "",
  email: "",
  direccion: "",
  mapsQuery: "",
  whatsapp: [],
  redes: { instagram: "", facebook: "", tiktok: "" },
  logoUrl: "",
  colorPrimario: "#c2410c",
  colorSecundario: "#14532d",
  zonaHoraria: ZONA_HORARIA_DEFAULT,
  moneda: MONEDA_DEFAULT,
  nosotros: { titulo: "Nosotros", parrafos: [], imagenes: [] },
  politicas: { razonSocial: "", nit: "", correoContacto: "", textoExtra: "" },
};

export const MENU_INFO_DEFAULT = {
  horarioCocina: "",
  menuDesayuno: "",
  menuDia: "",
  menuNoche: "",
  alergenos: "",
};

export const CONFIG_DEFAULTS = {
  home_theme: "a",
  menu_theme: "a",
  menu_info: MENU_INFO_DEFAULT,
  site: SITE_DEFAULT,
};

/** Mezcla profunda simple (objetos planos) para completar config con defaults. */
export function conDefaults(valor, defaults) {
  if (Array.isArray(defaults)) return Array.isArray(valor) ? valor : defaults;
  if (defaults && typeof defaults === "object") {
    const base = valor && typeof valor === "object" && !Array.isArray(valor) ? valor : {};
    const out = { ...base };
    for (const k of Object.keys(defaults)) out[k] = conDefaults(base[k], defaults[k]);
    return out;
  }
  return valor === undefined || valor === null ? defaults : valor;
}
