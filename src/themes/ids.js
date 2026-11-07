// Ids y textos de los temas, sin componentes: se pueden importar desde API y cliente.
// Al añadir un tema, agrégalo aquí y en registry.js (ver themes/README.md).

export const HOME_THEMES_INFO = [
  { id: "a", nombre: "Home A", descripcion: "Portada a todo color con horarios, mapa y redes." },
  { id: "b", nombre: "Home B", descripcion: "Pantalla dividida con tarjetas de información." },
];

export const MENU_THEMES_INFO = [
  { id: "a", nombre: "Menú A", descripcion: "Cuadrícula con filtros" },
  { id: "b", nombre: "Menú B", descripcion: "Lista tipo carta" },
  { id: "c", nombre: "Menú C", descripcion: "Editorial por categorías" },
];

export const HOME_THEME_IDS = HOME_THEMES_INFO.map((t) => t.id);
export const MENU_THEME_IDS = MENU_THEMES_INFO.map((t) => t.id);
