import "server-only";
import { z } from "zod";
import { HOME_THEME_IDS, MENU_THEME_IDS } from "@/themes/ids";

const corto = (max) => z.string().trim().max(max, `Máximo ${max} caracteres.`);
const urlOVacio = z.union([z.literal(""), z.string().trim().url("URL inválida.").max(1000)]);
const correoOVacio = z.union([z.literal(""), z.string().trim().toLowerCase().email("Correo inválido.").max(200)]);
const hex = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Color inválido (usa #RRGGBB).");

const zonaHoraria = z
  .string()
  .trim()
  .refine((tz) => {
    try {
      new Intl.DateTimeFormat("es", { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  }, "Zona horaria inválida.");

const moneda = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Moneda inválida (código ISO de 3 letras).")
  .refine((m) => {
    try {
      new Intl.NumberFormat("es", { style: "currency", currency: m });
      return true;
    } catch {
      return false;
    }
  }, "Moneda no soportada.");

export const siteSchema = z
  .object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(80),
    slogan: corto(120),
    descripcion: corto(300),
    telefono: corto(30),
    email: correoOVacio,
    direccion: corto(200),
    mapsQuery: corto(200),
    whatsapp: z
      .array(
        z.object({
          numero: z.string().trim().regex(/^\+?[\d\s-]{7,20}$/, "Número de WhatsApp inválido."),
          mensaje: corto(300),
        })
      )
      .max(5, "Máximo 5 números de WhatsApp."),
    redes: z.object({ instagram: urlOVacio, facebook: urlOVacio, tiktok: urlOVacio }),
    logoUrl: urlOVacio,
    colorPrimario: hex,
    colorSecundario: hex,
    zonaHoraria,
    moneda,
    nosotros: z.object({
      titulo: corto(80),
      parrafos: z.array(corto(1500)).max(20),
      imagenes: z.array(z.string().trim().url("URL de imagen inválida.").max(1000)).max(12, "Máximo 12 imágenes."),
    }),
    politicas: z.object({
      razonSocial: corto(150),
      nit: corto(40),
      correoContacto: correoOVacio,
      textoExtra: corto(5000),
    }),
  })
  .strict();

export const menuInfoSchema = z
  .object({
    horarioCocina: corto(300),
    menuDesayuno: corto(300),
    menuDia: corto(300),
    menuNoche: corto(300),
    alergenos: corto(600),
  })
  .strict();

export const VALIDADORES = {
  home_theme: z.enum(HOME_THEME_IDS, { error: "Diseño de página principal inválido." }),
  menu_theme: z.enum(MENU_THEME_IDS, { error: "Diseño de menú inválido." }),
  menu_info: menuInfoSchema,
  site: siteSchema,
};

export const patchSchema = z.object({
  updates: z
    .array(
      z.object({
        key: z.enum(Object.keys(VALIDADORES), { error: "Clave de configuración no permitida." }),
        value: z.unknown(),
      })
    )
    .min(1, "No hay cambios para guardar.")
    .max(4),
});
