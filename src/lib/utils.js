import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** "Arroz con Coco Ñame" → "arroz-con-coco-name" */
export function slugify(texto = "") {
  return String(texto)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Capitaliza la primera letra de la frase y normaliza espacios. */
export function capitalizar(texto = "") {
  const limpio = String(texto).replace(/\s+/g, " ").trim();
  if (!limpio) return "";
  return limpio.charAt(0).toLocaleUpperCase("es") + limpio.slice(1);
}

/** Normaliza espacios y saltos de línea de una descripción. */
export function limpiarTexto(texto = "") {
  return String(texto)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const formateadores = new Map();

/** Formatea un precio con Intl.NumberFormat (sin decimales). */
export function formatearPrecio(valor, moneda = "COP") {
  const clave = moneda || "COP";
  if (!formateadores.has(clave)) {
    let f;
    try {
      f = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: clave,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    } catch {
      f = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    formateadores.set(clave, f);
  }
  return formateadores.get(clave).format(Number(valor) || 0);
}

/** Iniciales para avatares. */
export function iniciales(nombre = "") {
  return String(nombre)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** Número de WhatsApp en formato wa.me (solo dígitos). */
export function enlaceWhatsApp(numero = "", mensaje = "") {
  const digitos = String(numero).replace(/\D/g, "");
  if (!digitos) return null;
  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : "";
  return `https://wa.me/${digitos}${texto}`;
}
