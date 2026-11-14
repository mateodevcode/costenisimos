import { Suspense } from "react";
import { connection } from "next/server";
import { getConfig, getSite } from "@/lib/config";
import { PIELES, pielDe } from "@/components/public/pieles";
import { cn } from "@/lib/utils";
import { variablesMarca } from "@/lib/colores";
import { JsonLd, OG_IMAGEN, SEO, jsonLdRestaurante } from "@/lib/seo";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata() {
  await connection();
  const site = await getSite();
  const titulo = `${site.nombre} | ${SEO.titulo}`;
  return {
    title: { default: titulo, template: `%s | ${site.nombre} Envigado` },
    description: SEO.descripcion,
    keywords: SEO.palabrasClave,
    applicationName: site.nombre,
    category: "restaurant",
    alternates: { canonical: "/" },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    openGraph: {
      type: "website",
      locale: "es_CO",
      siteName: site.nombre,
      title: titulo,
      description: SEO.descripcion,
      url: "/",
      images: [OG_IMAGEN],
    },
    twitter: { card: "summary_large_image", title: titulo, description: SEO.descripcion, images: [OG_IMAGEN.url] },
    // Señales geográficas para buscadores locales.
    other: {
      "geo.region": SEO.direccion.codigoRegion,
      "geo.placename": `${SEO.direccion.ciudad}, ${SEO.direccion.region}`,
      "geo.position": `${SEO.geo.lat};${SEO.geo.lng}`,
      ICBM: `${SEO.geo.lat}, ${SEO.geo.lng}`,
    },
    // Íconos: app/icon.svg y app/apple-icon.jsx (la C amarilla sobre verde).
  };
}

function MarcoCargando() {
  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    </div>
  );
}

async function Marco({ children }) {
  await connection();
  const { site, home_theme } = await getConfig();
  const piel = pielDe(home_theme);
  return (
    <div data-piel={piel} style={variablesMarca(site)} className={cn("flex min-h-dvh flex-col", PIELES[piel].fondo)}>
      <JsonLd datos={jsonLdRestaurante(site)} />
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2">
        Saltar al contenido
      </a>
      <PublicHeader site={site} piel={piel} />
      <div id="contenido" className="flex flex-1 flex-col">
        {children}
      </div>
      <PublicFooter site={site} piel={piel} />
    </div>
  );
}

export default function PublicLayout({ children }) {
  return (
    <Suspense fallback={<MarcoCargando />}>
      <Marco>{children}</Marco>
    </Suspense>
  );
}
