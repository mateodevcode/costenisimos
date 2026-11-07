"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAV_MASTER } from "@/components/master/navegacion";

const ETIQUETA_ROL = { empleado: "Empleado", admin: "Admin", superadmin: "Superadmin" };

function Navegacion({ role }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const items = NAV_MASTER.filter((n) => n.roles.includes(role));
  return (
    <SidebarMenu>
      {items.map((item) => {
        const activo = pathname.startsWith(item.href);
        const Icono = item.icono;
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={activo} tooltip={item.titulo}>
              <Link href={item.href} onClick={() => isMobile && setOpenMobile(false)}>
                <Icono />
                <span>{item.titulo}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function Titulo() {
  const pathname = usePathname();
  const actual = NAV_MASTER.find((n) => pathname.startsWith(n.href));
  return <h1 className="truncate text-base font-semibold">{actual?.titulo ?? "Panel"}</h1>;
}

/** Layout visual del panel: sidebar con marca (site.nombre) y header con título de la vista y menú de usuario. */
export function PanelShell({ nombreSitio, logoUrl, role, defaultOpen = true, children }) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild tooltip={nombreSitio}>
                <Link href="/master">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- el logo puede venir de cualquier dominio configurado
                    <img src={logoUrl} alt="" className="size-8 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
                      {nombreSitio.charAt(0)}
                    </span>
                  )}
                  <span className="grid min-w-0 leading-tight">
                    <span className="truncate font-semibold">{nombreSitio}</span>
                    <span className="truncate text-xs text-muted-foreground">Panel de administración</span>
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Gestión</SidebarGroupLabel>
            <SidebarGroupContent>
              <Navegacion role={role} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Ver carta pública">
                <a href="/menu" target="_blank" rel="noopener noreferrer">
                  <ExternalLink />
                  <span>Ver carta pública</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-5" />
          <Titulo />
          <div className="ml-auto flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:inline-flex">
              {ETIQUETA_ROL[role] ?? role}
            </Badge>
            <UserMenu mostrarPanel={false} />
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
