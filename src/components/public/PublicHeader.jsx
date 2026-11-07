"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Menu } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { IconoWhatsApp } from "@/components/public/iconos";
import { PIELES } from "@/components/public/pieles";
import { Logo } from "@/themes/marca/Logo";
import { whatsappPrincipal } from "@/themes/marca/datos";
import { cn } from "@/lib/utils";

const ENLACES = [
  { href: "/", texto: "Inicio" },
  { href: "/menu", texto: "La carta" },
  { href: "/nosotros", texto: "Nosotros" },
];

export function PublicHeader({ site, piel = "tropical" }) {
  const p = PIELES[piel] ?? PIELES.tropical;
  const pathname = usePathname();
  const reducir = useReducedMotion();
  const [abierto, setAbierto] = useState(false);
  const [compacto, setCompacto] = useState(false);
  const activo = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const wa = whatsappPrincipal(site);

  // Se compacta al hacer scroll.
  useEffect(() => {
    const onScroll = () => setCompacto(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={reducir ? false : { y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn("sticky top-0 z-40 transition-[box-shadow]", p.header, compacto && "shadow-lg shadow-black/10")}
    >
      {piel === "kraft" && <div className="h-1.5 bg-navy" aria-hidden />}
      <div className={cn("mx-auto flex max-w-[1220px] items-center justify-between gap-4 px-5 transition-[height] duration-300", compacto ? "h-16" : "h-20")}>
        <Link href="/" aria-label={`${site.nombre}, inicio`} className={cn("block shrink-0 transition-[width] duration-300", compacto ? "w-32" : "w-40 sm:w-44", p.logo)}>
          <Logo titulo={site.nombre} />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-7 md:flex">
          {ENLACES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              aria-current={activo(e.href) ? "page" : undefined}
              className={cn("text-[15.5px] font-semibold underline-offset-8 transition hover:underline", activo(e.href) ? p.enlaceActivo : p.enlace)}
            >
              {e.texto}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {wa.href && (
            <a
              href={wa.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("hidden h-11 items-center gap-2 rounded-full px-5 text-[15px] font-bold transition lg:inline-flex", p.cta)}
            >
              <IconoWhatsApp className="size-4" />
              Pedir por WhatsApp
            </a>
          )}
          <UserMenu variant={piel === "kraft" ? "light" : "dark"} />
          <Sheet open={abierto} onOpenChange={setAbierto}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 hover:text-current md:hidden" aria-label="Abrir menú">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className={cn("w-80 border-none", p.header)}>
              <SheetHeader>
                <SheetTitle className={cn("w-36", p.logo)}>
                  <Logo titulo={site.nombre} />
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Móvil" className="grid px-4">
                {ENLACES.map((e, i) => (
                  <motion.div
                    key={e.href}
                    initial={reducir ? false : { opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i + 0.1 }}
                  >
                    <Link
                      href={e.href}
                      onClick={() => setAbierto(false)}
                      aria-current={activo(e.href) ? "page" : undefined}
                      className={cn("flex min-h-14 items-center border-b border-current/15 font-fraunces text-2xl fraunces-suave", activo(e.href) && "underline decoration-2 underline-offset-8")}
                    >
                      {e.texto}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              {wa.href && (
                <a
                  href={wa.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("mx-4 mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full font-bold", p.cta)}
                >
                  <IconoWhatsApp className="size-5" />
                  Pedir por WhatsApp
                </a>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
