import { Suspense } from "react";
import { connection } from "next/server";
import { getConfig } from "@/lib/config";
import { HOME_THEMES, getTheme } from "@/themes/registry";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata() {
  await connection();
  const { site } = await getConfig();
  return { title: { absolute: site.slogan ? `${site.nombre} · ${site.slogan}` : site.nombre } };
}

async function Home() {
  await connection();
  const { site, menu_info, home_theme } = await getConfig();
  const { Componente } = getTheme(HOME_THEMES, home_theme);
  return <Componente site={site} menuInfo={menu_info} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto my-10 h-[60dvh] w-[calc(100%-2rem)] max-w-6xl rounded-3xl" />}>
      <Home />
    </Suspense>
  );
}
