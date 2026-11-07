import dynamic from "next/dynamic";
import { HOME_THEMES_INFO, MENU_THEMES_INFO } from "@/themes/ids";

const info = (lista, id) => lista.find((t) => t.id === id);

export const HOME_THEMES = [
  { ...info(HOME_THEMES_INFO, "a"), Componente: dynamic(() => import("./home/HomeTropical")) },
  { ...info(HOME_THEMES_INFO, "b"), Componente: dynamic(() => import("./home/HomeKraft")) },
  { ...info(HOME_THEMES_INFO, "c"), Componente: dynamic(() => import("./home/HomeAutentico")) },
];

export const MENU_THEMES = [
  { ...info(MENU_THEMES_INFO, "a"), Componente: dynamic(() => import("./menu/MenuTropical")) },
  { ...info(MENU_THEMES_INFO, "b"), Componente: dynamic(() => import("./menu/MenuKraft")) },
  { ...info(MENU_THEMES_INFO, "c"), Componente: dynamic(() => import("./menu/MenuCartaImpresa")) },
];

export const getTheme = (lista, id) => lista.find((t) => t.id === id) || lista[0];
