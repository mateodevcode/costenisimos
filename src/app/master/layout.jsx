import { Suspense } from "react";
import { cookies } from "next/headers";
import { requerirPanel } from "@/lib/auth/pagina";
import { getSite } from "@/lib/config";
import { PanelShell } from "@/components/master/PanelShell";
import { PanelCargando } from "@/components/master/PanelCargando";

// El panel depende de la sesión: se permite que la navegación espere al servidor.
export const instant = false;

export const metadata = {
  title: { default: "Panel", template: "%s · Panel" },
  robots: { index: false, follow: false },
};

/** Verificación real (con BD) de rol y bloqueo. El proxy solo valida el JWT. */
async function Guardia({ children }) {
  const usuario = await requerirPanel();
  const [site, store] = await Promise.all([getSite(), cookies()]);
  const sidebarAbierto = store.get("sidebar_state")?.value !== "false";
  return (
    <PanelShell nombreSitio={site.nombre} logoUrl={site.logoUrl} role={usuario.role} defaultOpen={sidebarAbierto}>
      {children}
    </PanelShell>
  );
}

export default function MasterLayout({ children }) {
  return (
    <Suspense fallback={<PanelCargando completo />}>
      <Guardia>{children}</Guardia>
    </Suspense>
  );
}
