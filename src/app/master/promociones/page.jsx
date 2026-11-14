import { Suspense } from "react";
import { requerirRolPagina } from "@/lib/auth/pagina";
import { getPromociones } from "@/lib/promociones";
import { getSite } from "@/lib/config";
import { ROLES_ADMIN } from "@/lib/constants";
import { PromocionesView } from "@/components/master/PromocionesView";
import { PanelCargando } from "@/components/master/PanelCargando";

export const metadata = { title: "Promociones" };

async function Contenido() {
  await requerirRolPagina(ROLES_ADMIN);
  const [promociones, site] = await Promise.all([getPromociones(), getSite()]);
  return <PromocionesView promociones={promociones} moneda={site.moneda} />;
}

export default function PromocionesPage() {
  return (
    <Suspense fallback={<PanelCargando />}>
      <Contenido />
    </Suspense>
  );
}
