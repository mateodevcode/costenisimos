// Ids y textos de los temas, sin componentes: se pueden importar desde API y cliente.
// Al añadir un tema, agrégalo aquí y en registry.js (ver themes/README.md).

export const HOME_THEMES_INFO = [
  { id: "a", nombre: "Tropical", descripcion: "Azul de la caja de domicilios con hojas de colores y fotos en arco." },
  { id: "b", nombre: "Papel kraft", descripcion: "Papel kraft con tinta azul, polaroids y notas a mano." },
  { id: "c", nombre: "Lo auténtico", descripcion: "La pared verde oliva del local, letrero a mano y sello naranja." },
];

export const MENU_THEMES_INFO = [
  { id: "a", nombre: "Tropical", descripcion: "Pestañas por categoría y tarjetas con foto en arco." },
  { id: "b", nombre: "Papel kraft", descripcion: "Hojas de papel por categoría, lista artesanal y polaroids." },
  { id: "c", nombre: "Carta impresa", descripcion: "Como las cartas del local: sello naranja y precios en rosado." },
];

export const HOME_THEME_IDS = HOME_THEMES_INFO.map((t) => t.id);
export const MENU_THEME_IDS = MENU_THEMES_INFO.map((t) => t.id);
