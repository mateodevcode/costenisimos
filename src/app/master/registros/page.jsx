import { requerirRolPagina } from "@/lib/auth/pagina";
import { ROLES_ADMIN } from "@/lib/constants";
import { Suspense } from "react";
import { RegistrosView } from "@/components/master/RegistrosView";
import { PanelCargando } from "@/components/master/PanelCargando";

export const metadata = { title: "Registros" };

export default function RegistrosPage() {
  return (
    <Suspense fallback={<PanelCargando />}>
      <Contenido />
    </Suspense>
  );
}

async function Contenido() {
  await requerirRolPagina(ROLES_ADMIN);
  return <RegistrosView />;
}
