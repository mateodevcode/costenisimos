import dynamic from "next/dynamic";
import { HOME_THEMES_INFO, MENU_THEMES_INFO } from "@/themes/ids";

const info = (lista, id) => lista.find((t) => t.id === id);

export const HOME_THEMES = [
  { ...info(HOME_THEMES_INFO, "a"), Componente: dynamic(() => import("./home/HomeA")) },
  { ...info(HOME_THEMES_INFO, "b"), Componente: dynamic(() => import("./home/HomeB")) },
];

export const MENU_THEMES = [
  { ...info(MENU_THEMES_INFO, "a"), Componente: dynamic(() => import("./menu/MenuA")) },
  { ...info(MENU_THEMES_INFO, "b"), Componente: dynamic(() => import("./menu/MenuB")) },
  { ...info(MENU_THEMES_INFO, "c"), Componente: dynamic(() => import("./menu/MenuC")) },
];

export const getTheme = (lista, id) => lista.find((t) => t.id === id) || lista[0];
