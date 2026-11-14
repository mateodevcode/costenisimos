import { absoluta, urlBase } from "@/lib/seo";

/** robots.txt: la web pública se indexa; el panel y la API no. */
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/master", "/api/"] }],
    sitemap: absoluta("/sitemap.xml"),
    host: urlBase(),
  };
}
