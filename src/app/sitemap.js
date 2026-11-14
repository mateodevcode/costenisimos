import { absoluta } from "@/lib/seo";

/** Mapa del sitio para buscadores (solo páginas públicas e indexables). */
export default function sitemap() {
  const ahora = new Date();
  return [
    { url: absoluta("/"), lastModified: ahora, changeFrequency: "weekly", priority: 1 },
    { url: absoluta("/menu"), lastModified: ahora, changeFrequency: "daily", priority: 0.9 },
    { url: absoluta("/nosotros"), lastModified: ahora, changeFrequency: "monthly", priority: 0.7 },
  ];
}
