import { Suspense } from "react";
import { requerirRolPagina } from "@/lib/auth/pagina";
import { getCatalogo } from "@/lib/catalogo";
import { ROLES_ADMIN } from "@/lib/constants";
import { OrdenarCategoriasView } from "@/components/master/OrdenarCategoriasView";
import { PanelCargando } from "@/components/master/PanelCargando";

export const metadata = { title: "Ordenar categorías" };

async function Contenido() {
  await requerirRolPagina(ROLES_ADMIN);
  const { categorias, productos } = await getCatalogo();
  const conteo = {};
  for (const p of productos) conteo[p.categoria] = (conteo[p.categoria] || 0) + 1;
  const firma = categorias.map((c) => c.id).join(",");
  return <OrdenarCategoriasView key={firma} categorias={categorias} conteo={conteo} />;
}

export default function OrdenarCategoriasPage() {
  return (
    <Suspense fallback={<PanelCargando />}>
      <Contenido />
    </Suspense>
  );
}
