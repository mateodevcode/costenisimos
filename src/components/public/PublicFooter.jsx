import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { Redes } from "@/components/public/Redes";
import { PIELES } from "@/components/public/pieles";
import { Logo } from "@/themes/marca/Logo";
import { telefonoHref, telefonoLegible, whatsappPrincipal } from "@/themes/marca/datos";
import { cn } from "@/lib/utils";

export function PublicFooter({ site, piel = "tropical" }) {
  const p = PIELES[piel] ?? PIELES.tropical;
  const tel = site.telefono || whatsappPrincipal(site).numero;
  return (
    <footer className={cn("relative", p.footer)}>
      <div className="mx-auto grid max-w-[1220px] gap-10 px-5 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="grid content-start gap-4">
          <Link href="/" aria-label={`${site.nombre}, inicio`} className={cn("block w-48", p.logo)}>
            <Logo titulo={site.nombre} />
          </Link>
          {site.slogan && <p className={cn("max-w-xs font-fraunces text-lg italic fraunces-suave", p.footerSuave)}>{site.slogan}</p>}
          <Redes redes={site.redes} itemClassName={p.redes} />
        </div>
        <div className="grid content-start gap-3 text-[15px]">
          <p className="font-bold tracking-wide uppercase">Visítanos</p>
          {site.direccion && (
            <p className={cn("flex gap-2", p.footerSuave)}>
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {site.direccion}
            </p>
          )}
          {tel && (
            <a href={telefonoHref(tel)} className={cn("flex gap-2 hover:underline", p.footerSuave)}>
              <Phone className="mt-0.5 size-4 shrink-0" />
              {telefonoLegible(tel)}
            </a>
          )}
        </div>
        <nav aria-label="Pie de página" className="grid content-start gap-2 text-[15px]">
          <p className="font-bold tracking-wide uppercase">Explora</p>
          {[
            ["/menu", "La carta"],
            ["/nosotros", "Nosotros"],
            ["/politicas-de-privacidad", "Política de privacidad"],
          ].map(([href, texto]) => (
            <Link key={href} href={href} className={cn("w-fit hover:underline", p.footerSuave)}>
              {texto}
            </Link>
          ))}
        </nav>
      </div>
      <p className={cn("border-t py-5 text-center text-xs", p.footerBorde, p.footerSuave)}>
        © {site.nombre}. Hecho con sabor costeño.
      </p>
    </footer>
  );
}
