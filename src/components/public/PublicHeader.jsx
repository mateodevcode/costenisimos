"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const ENLACES = [
  { href: "/", texto: "Inicio" },
  { href: "/menu", texto: "Menú" },
  { href: "/nosotros", texto: "Nosotros" },
];

export function Logo({ site, className }) {
  return (
    <Link href="/" className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {site.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- el logo puede venir de cualquier dominio configurado
        <img src={site.logoUrl} alt="" width={36} height={36} className="size-9 shrink-0 rounded-full object-cover" />
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand font-display text-lg font-semibold text-brand-foreground">
          {(site.nombre || "R").charAt(0)}
        </span>
      )}
      <span className="truncate font-display text-lg font-semibold tracking-tight">{site.nombre}</span>
    </Link>
  );
}

export function PublicHeader({ site }) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const activo = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo site={site} />
        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {ENLACES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              aria-current={activo(e.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-muted",
                activo(e.href) ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {e.texto}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <UserMenu />
          <Sheet open={abierto} onOpenChange={setAbierto}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>{site.nombre}</SheetTitle>
              </SheetHeader>
              <nav aria-label="Móvil" className="grid gap-1 px-4">
                {ENLACES.map((e) => (
                  <Link
                    key={e.href}
                    href={e.href}
                    onClick={() => setAbierto(false)}
                    aria-current={activo(e.href) ? "page" : undefined}
                    className={cn("rounded-lg px-3 py-2.5 text-base font-medium hover:bg-muted", activo(e.href) && "bg-muted")}
                  >
                    {e.texto}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
