import { Suspense } from "react";
import { connection } from "next/server";
import { getConfig } from "@/lib/config";
import { getCatalogo } from "@/lib/catalogo";
import { HOME_THEMES, getTheme } from "@/themes/registry";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata() {
  await connection();
  const { site } = await getConfig();
  return { title: { absolute: site.slogan ? `${site.nombre} · ${site.slogan}` : site.nombre } };
}

/**
 * Platos para "Favoritos de la casa": uno por categoría (en el orden de la carta),
 * disponibles y con foto; hasta 6. Incluye el nombre de la categoría.
 */
function elegirDestacados({ categorias, productos }, max = 6) {
  const nombreCat = new Map(categorias.map((c) => [c.id, c.nombre]));
  const elegibles = productos.filter((p) => p.disponibilidad && p.image);
  const porCategoria = categorias.map((c) => elegibles.find((p) => p.categoria === c.id)).filter(Boolean);
  const resto = elegibles.filter((p) => !porCategoria.includes(p));
  return [...porCategoria, ...resto].slice(0, max).map((p) => ({ ...p, categoriaNombre: nombreCat.get(p.categoria) ?? "" }));
}

async function Home() {
  await connection();
  const [{ site, menu_info, home_theme }, catalogo] = await Promise.all([getConfig(), getCatalogo()]);
  const { Componente } = getTheme(HOME_THEMES, home_theme);
  return <Componente site={site} menuInfo={menu_info} destacados={elegirDestacados(catalogo)} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto my-10 h-[60dvh] w-[calc(100%-2rem)] max-w-6xl rounded-3xl" />}>
      <Home />
    </Suspense>
  );
}
