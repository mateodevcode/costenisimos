import { Suspense } from "react";
import { connection } from "next/server";
import { getConfig } from "@/lib/config";
import { getCatalogo } from "@/lib/catalogo";
import { getPromociones, promocionesVigentes } from "@/lib/promociones";
import { SEO } from "@/lib/seo";
import { HOME_THEMES, getTheme } from "@/themes/registry";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata() {
  await connection();
  const { site } = await getConfig();
  return {
    title: { absolute: `${site.nombre} | ${SEO.titulo}` },
    description: SEO.descripcion,
    alternates: { canonical: "/" },
  };
}

/**
 * Platos para "Los imperdibles": los marcados como imperdibles en el panel (disponibles y con foto,
 * en el orden de la carta). Si no hay ninguno marcado, uno por categoría como antes. Hasta 6.
 */
function elegirDestacados({ categorias, productos }, max = 6) {
  const nombreCat = new Map(categorias.map((c) => [c.id, c.nombre]));
  const ordenCat = new Map(categorias.map((c, i) => [c.id, i]));
  const elegibles = productos.filter((p) => p.disponibilidad && p.image);
  const marcados = elegibles
    .filter((p) => p.imperdible)
    .sort((a, b) => (ordenCat.get(a.categoria) ?? 99) - (ordenCat.get(b.categoria) ?? 99));
  let lista = marcados;
  if (!lista.length) {
    const porCategoria = categorias.map((c) => elegibles.find((p) => p.categoria === c.id)).filter(Boolean);
    lista = [...porCategoria, ...elegibles.filter((p) => !porCategoria.includes(p))];
  }
  return lista.slice(0, max).map((p) => ({ ...p, categoriaNombre: nombreCat.get(p.categoria) ?? "" }));
}

async function Home() {
  await connection();
  const [{ site, menu_info, home_theme }, catalogo, promociones] = await Promise.all([getConfig(), getCatalogo(), getPromociones()]);
  const { Componente } = getTheme(HOME_THEMES, home_theme);
  return <Componente site={site} menuInfo={menu_info} destacados={elegirDestacados(catalogo)} promociones={promocionesVigentes(promociones)} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto my-10 h-[60dvh] w-[calc(100%-2rem)] max-w-6xl rounded-3xl" />}>
      <Home />
    </Suspense>
  );
}
