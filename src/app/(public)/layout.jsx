import { Suspense } from "react";
import { connection } from "next/server";
import { getConfig, getSite } from "@/lib/config";
import { PIELES, pielDe } from "@/components/public/pieles";
import { cn } from "@/lib/utils";
import { variablesMarca } from "@/lib/colores";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata() {
  await connection();
  const site = await getSite();
  const descripcion = site.descripcion || site.slogan || `Carta digital de ${site.nombre}`;
  return {
    title: { default: site.nombre, template: `%s | ${site.nombre}` },
    description: descripcion,
    applicationName: site.nombre,
    openGraph: {
      type: "website",
      locale: "es_CO",
      siteName: site.nombre,
      title: site.nombre,
      description: descripcion,
      ...(site.logoUrl ? { images: [{ url: site.logoUrl }] } : {}),
    },
    ...(site.logoUrl ? { icons: { icon: site.logoUrl, apple: site.logoUrl } } : {}),
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
    <div style={variablesMarca(site)} className={cn("flex min-h-dvh flex-col", PIELES[piel].fondo)}>
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
