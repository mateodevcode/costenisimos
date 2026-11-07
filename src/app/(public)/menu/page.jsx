import { Suspense } from "react";
import { connection } from "next/server";
import { getConfig } from "@/lib/config";
import { getCatalogo } from "@/lib/catalogo";
import { MENU_THEMES, getTheme } from "@/themes/registry";
import { MenuCargando } from "@/components/public/MenuCargando";

export async function generateMetadata() {
  await connection();
  const { site } = await getConfig();
  return {
    title: "Menú",
    description: `Consulta la carta de ${site.nombre}: platos, precios e ingredientes.`,
  };
}

async function Menu() {
  await connection();
  const [config, { categorias, productos, ingredientes }] = await Promise.all([getConfig(), getCatalogo()]);
  const { Componente } = getTheme(MENU_THEMES, config.menu_theme);
  return (
    <Componente
      categorias={categorias}
      productos={productos}
      ingredientes={ingredientes}
      site={config.site}
      menuInfo={config.menu_info}
    />
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuCargando />}>
      <Menu />
    </Suspense>
  );
}
