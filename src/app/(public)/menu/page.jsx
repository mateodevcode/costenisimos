import { Suspense } from "react";
import { connection } from "next/server";
import { getConfig } from "@/lib/config";
import { getCatalogo } from "@/lib/catalogo";
import { JsonLd, OG_IMAGEN, jsonLdMenu } from "@/lib/seo";
import { MENU_THEMES, getTheme } from "@/themes/registry";
import { MenuCargando } from "@/components/public/MenuCargando";

export async function generateMetadata() {
  await connection();
  const [{ site }, { categorias }] = await Promise.all([getConfig(), getCatalogo()]);
  const secciones = categorias.slice(0, 6).map((c) => c.nombre.toLowerCase()).join(", ");
  const descripcion = `Carta y precios de ${site.nombre}, comida costeña en Envigado (Medellín)${
    secciones ? `: ${secciones}` : ""
  }. Desayunos, almuerzos y cena; pide a domicilio por WhatsApp.`;
  return {
    title: "Carta y precios",
    description: descripcion,
    alternates: { canonical: "/menu" },
    openGraph: { title: `Carta y precios | ${site.nombre}`, description: descripcion, url: "/menu", images: [OG_IMAGEN] },
  };
}

async function Menu() {
  await connection();
  const [config, catalogo] = await Promise.all([getConfig(), getCatalogo()]);
  const { categorias, productos, ingredientes } = catalogo;
  const { Componente } = getTheme(MENU_THEMES, config.menu_theme);
  return (
    <>
      <JsonLd datos={jsonLdMenu(config.site, catalogo)} />
      <Componente
        categorias={categorias}
        productos={productos}
        ingredientes={ingredientes}
        site={config.site}
        menuInfo={config.menu_info}
      />
    </>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuCargando />}>
      <Menu />
    </Suspense>
  );
}
