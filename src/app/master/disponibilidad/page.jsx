import { Suspense } from "react";
import { requerirRolPagina } from "@/lib/auth/pagina";
import { getCatalogo } from "@/lib/catalogo";
import { getSite } from "@/lib/config";
import { ROLES_PANEL } from "@/lib/constants";
import { DisponibilidadView } from "@/components/master/DisponibilidadView";
import { PanelCargando } from "@/components/master/PanelCargando";

export const metadata = { title: "Disponibilidad" };

async function Contenido() {
  await requerirRolPagina(ROLES_PANEL);
  const [{ categorias, productos }, site] = await Promise.all([getCatalogo(), getSite()]);
  return <DisponibilidadView categorias={categorias} productos={productos} moneda={site.moneda} />;
}

export default function DisponibilidadPage() {
  return (
    <Suspense fallback={<PanelCargando />}>
      <Contenido />
    </Suspense>
  );
}
