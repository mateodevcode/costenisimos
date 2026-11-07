import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connectDB } from "@/lib/db";
import Configuracion from "@/models/Configuracion";
import { CONFIG_DEFAULTS, conDefaults } from "@/lib/constants";

export const TAG_CONFIG = "config";

/** Toda la configuración (con defaults), cacheada con tag "config". */
export async function getConfig() {
  "use cache";
  cacheLife("max");
  cacheTag(TAG_CONFIG);

  await connectDB();
  const docs = await Configuracion.find({}).lean();
  const mapa = Object.fromEntries(docs.map((d) => [d.key, d.value]));
  const out = {};
  for (const [key, def] of Object.entries(CONFIG_DEFAULTS)) {
    out[key] = conDefaults(mapa[key], def);
  }
  return JSON.parse(JSON.stringify(out));
}

export async function getSite() {
  return (await getConfig()).site;
}

export async function getMenuInfo() {
  return (await getConfig()).menu_info;
}
