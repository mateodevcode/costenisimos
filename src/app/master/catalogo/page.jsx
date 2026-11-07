import { Suspense } from "react";
import { requerirRolPagina } from "@/lib/auth/pagina";
import { getCatalogo } from "@/lib/catalogo";
import { getSite } from "@/lib/config";
import { ROLES_ADMIN } from "@/lib/constants";
import { CatalogoView } from "@/components/master/catalogo/CatalogoView";
import { PanelCargando } from "@/components/master/PanelCargando";

export const metadata = { title: "Catálogo" };

async function Contenido() {
  await requerirRolPagina(ROLES_ADMIN);
  const [catalogo, site] = await Promise.all([getCatalogo(), getSite()]);
  return <CatalogoView {...catalogo} moneda={site.moneda} />;
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<PanelCargando />}>
      <Contenido />
    </Suspense>
  );
}
