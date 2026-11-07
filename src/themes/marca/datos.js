// Ayudantes de datos para los temas (sin dependencias de servidor ni de cliente).

import { MENU_TIPOS } from "@/lib/constants";
import { enlaceWhatsApp } from "@/lib/utils";

/** Primer número de WhatsApp configurado (o el teléfono como respaldo). */
export function whatsappPrincipal(site) {
  const w = site?.whatsapp?.find((x) => x?.numero) ?? null;
  const numero = w?.numero || site?.telefono || "";
  return { numero, mensaje: w?.mensaje || "", href: enlaceWhatsApp(numero, w?.mensaje || "") };
}

/** Enlace de WhatsApp con un mensaje concreto (pedidos, reservas). */
export function whatsappCon(site, mensaje) {
  return enlaceWhatsApp(whatsappPrincipal(site).numero, mensaje);
}

export function telefonoHref(tel = "") {
  const limpio = String(tel).replace(/[^\d+]/g, "");
  return limpio ? `tel:${limpio}` : null;
}

/** "573202729672" → "320 272 9672" (formato colombiano cuando aplica). */
export function telefonoLegible(tel = "") {
  const d = String(tel).replace(/\D/g, "");
  const local = d.startsWith("57") && d.length === 12 ? d.slice(2) : d;
  if (local.length === 10) return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  return tel;
}

const CLAVES = { desayuno: "menuDesayuno", dia: "menuDia", noche: "menuNoche" };

/** Horarios configurados en menu_info, listos para pintar. */
export function horarios(menuInfo) {
  const lista = [];
  if (menuInfo?.horarioCocina) lista.push({ id: "cocina", nombre: "Cocina", valor: menuInfo.horarioCocina });
  for (const m of MENU_TIPOS) {
    const valor = menuInfo?.[CLAVES[m.id]];
    if (valor) lista.push({ id: m.id, nombre: `Menú ${m.nombre.toLowerCase()}`, valor });
  }
  return lista;
}

export function consultaMapa(site) {
  return site?.mapsQuery || site?.direccion || "";
}

/** Imágenes de marca (public/marca). Se usan si el sitio no tiene galería propia. */
export const IMG = {
  bolsa: "/marca/bolsa.webp",
  aviso: "/marca/aviso.webp",
  cajaMesa: "/marca/caja-mesa.webp",
  cajaToHome: "/marca/caja-to-home.webp",
  empanadas: "/marca/empanadas-caja.webp",
  lampara: "/marca/lampara.webp",
  pared: "/marca/pared-autentico.webp",
  cartas: "/marca/cartas-pared.webp",
  tarjetas: "/marca/tarjetas.webp",
  portadaCarta: "/marca/portada-carta.webp",
};

/** Galería: primero las imágenes subidas en "Nosotros", luego las de marca. */
export function galeria(site, respaldo = [IMG.aviso, IMG.cajaMesa, IMG.bolsa, IMG.pared]) {
  const propias = site?.nosotros?.imagenes ?? [];
  return propias.length ? propias : respaldo;
}
