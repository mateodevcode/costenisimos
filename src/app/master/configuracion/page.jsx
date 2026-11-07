import { requerirRolPagina } from "@/lib/auth/pagina";
import { getConfig } from "@/lib/config";
import { ROLES_ADMIN } from "@/lib/constants";
import { HOME_THEMES_INFO, MENU_THEMES_INFO } from "@/themes/ids";
import { Suspense } from "react";
import { ConfiguracionView } from "@/components/master/configuracion/ConfiguracionView";
import { PanelCargando } from "@/components/master/PanelCargando";

export const metadata = { title: "Configuración" };

export default function ConfiguracionPage() {
  return (
    <Suspense fallback={<PanelCargando />}>
      <Contenido />
    </Suspense>
  );
}

async function Contenido() {
  await requerirRolPagina(ROLES_ADMIN);
  const config = await getConfig();
  return <ConfiguracionView config={config} temasHome={HOME_THEMES_INFO} temasMenu={MENU_THEMES_INFO} />;
}
