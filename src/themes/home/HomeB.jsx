// Home B — Pantalla dividida: texto a un lado, bloque de marca al otro, y tarjetas de información.

import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin, Phone, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mapa, enlaceMapa } from "@/components/public/Mapa";
import { Redes } from "@/components/public/Redes";
import { WhatsAppFlotante } from "@/components/public/WhatsAppFlotante";
import { horarios, telefonoHref } from "@/themes/home/comun";

function Tarjeta({ icono: Icono, titulo, children }) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border bg-card p-6 shadow-sm">
      <span className="flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Icono className="size-5" />
      </span>
      <h3 className="font-display text-xl font-semibold">{titulo}</h3>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export default function HomeB({ site, menuInfo }) {
  const lista = horarios(menuInfo);
  const consulta = site.mapsQuery || site.direccion;

  return (
    <main>
      <section className="grid min-h-[78dvh] md:grid-cols-2">
        <div className="flex flex-col justify-center gap-6 px-6 py-16 sm:px-12 lg:px-20">
          <p className="text-sm font-semibold tracking-[0.25em] text-brand uppercase">Bienvenidos</p>
          <h1 className="font-display text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">{site.nombre}</h1>
          {site.slogan && <p className="max-w-md text-lg text-muted-foreground">{site.slogan}</p>}
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-full bg-brand px-6 text-base text-brand-foreground hover:bg-brand/90">
              <Link href="/menu">Ver carta</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6 text-base">
              <Link href="/nosotros">Conócenos</Link>
            </Button>
          </div>
        </div>
        <div className="relative flex min-h-80 items-center justify-center overflow-hidden bg-brand-2 text-brand-2-foreground">
          <div aria-hidden className="absolute -top-20 -right-20 size-80 rounded-full bg-brand opacity-70 blur-0" />
          <div aria-hidden className="absolute -bottom-24 -left-16 size-72 rounded-full border-[28px] border-current opacity-10" />
          <div className="relative grid justify-items-center gap-4 p-10 text-center">
            {site.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- el logo puede venir de cualquier dominio configurado
              <img src={site.logoUrl} alt={site.nombre} width={176} height={176} className="size-44 rounded-full object-cover shadow-2xl ring-8 ring-white/20" />
            ) : (
              <UtensilsCrossed className="size-24 opacity-90" />
            )}
            {site.descripcion && <p className="max-w-sm text-pretty opacity-90">{site.descripcion}</p>}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-16 sm:grid-cols-2 lg:grid-cols-3">
        <Tarjeta icono={Clock} titulo="Horarios">
          {menuInfo?.horarioCocina && <p className="mb-2 text-foreground">{menuInfo.horarioCocina}</p>}
          <ul className="grid gap-1">
            {lista.map((h) => (
              <li key={h.id}>
                <span className="font-medium text-foreground">{h.nombre}:</span> {h.valor}
              </li>
            ))}
          </ul>
          {!menuInfo?.horarioCocina && lista.length === 0 && <p>Consulta nuestros horarios por teléfono.</p>}
        </Tarjeta>
        <Tarjeta icono={MapPin} titulo="Ubicación">
          <p>{site.direccion || "Pronto publicaremos nuestra dirección."}</p>
          {consulta && (
            <a href={enlaceMapa(consulta)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 font-medium text-brand">
              Abrir en Maps <ArrowUpRight className="size-4" />
            </a>
          )}
        </Tarjeta>
        <Tarjeta icono={Phone} titulo="Contacto">
          <ul className="grid gap-1.5">
            {site.telefono && (
              <li>
                <a href={telefonoHref(site.telefono)} className="inline-flex items-center gap-2 hover:text-foreground">
                  <Phone className="size-4" /> {site.telefono}
                </a>
              </li>
            )}
            {site.email && (
              <li>
                <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 break-all hover:text-foreground">
                  <Mail className="size-4" /> {site.email}
                </a>
              </li>
            )}
          </ul>
          <Redes redes={site.redes} className="mt-3" itemClassName="size-9 border text-foreground hover:bg-muted" />
        </Tarjeta>
      </section>

      {consulta && (
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <Mapa query={consulta} titulo={`Ubicación de ${site.nombre}`} className="h-96" />
        </section>
      )}

      <WhatsAppFlotante whatsapp={site.whatsapp} nombre={site.nombre} />
    </main>
  );
}
