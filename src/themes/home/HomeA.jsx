// Home A — Portada a todo color: hero con nombre/slogan y "Ver carta", horarios + dirección + mapa,
// cierre con redes y botón flotante de WhatsApp.

import Link from "next/link";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mapa, enlaceMapa } from "@/components/public/Mapa";
import { Redes } from "@/components/public/Redes";
import { WhatsAppFlotante } from "@/components/public/WhatsAppFlotante";
import { horarios, telefonoHref } from "@/themes/home/comun";

export default function HomeA({ site, menuInfo }) {
  const lista = horarios(menuInfo);
  const consulta = site.mapsQuery || site.direccion;

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-brand text-brand-foreground">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--brand-2) 0, transparent 40%), radial-gradient(circle at 80% 70%, var(--brand-2) 0, transparent 35%)",
          }}
        />
        <div className="mx-auto flex min-h-[72dvh] max-w-6xl flex-col items-start justify-center gap-6 px-4 py-20">
          {site.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- el logo puede venir de cualquier dominio configurado
            <img src={site.logoUrl} alt="" width={88} height={88} className="size-22 rounded-full border-4 border-current/20 object-cover" />
          )}
          <h1 className="max-w-3xl font-display text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-7xl">{site.nombre}</h1>
          {site.slogan && <p className="max-w-xl text-lg text-pretty opacity-90 sm:text-xl">{site.slogan}</p>}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg" className="h-12 rounded-full bg-background px-6 text-base text-foreground hover:bg-background/90">
              <Link href="/menu">
                Ver carta <ArrowRight />
              </Link>
            </Button>
            {site.telefono && (
              <Button asChild size="lg" variant="ghost" className="h-12 rounded-full border border-current/30 px-6 text-base hover:bg-white/10 hover:text-current">
                <a href={telefonoHref(site.telefono)}>
                  <Phone /> Llamar
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div className="grid content-start gap-8">
          {site.descripcion && <p className="font-display text-2xl leading-snug text-pretty">{site.descripcion}</p>}
          {(lista.length > 0 || menuInfo?.horarioCocina) && (
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-brand uppercase">
                <Clock className="size-4" /> Horarios
              </h2>
              <dl className="divide-y rounded-2xl border">
                {menuInfo?.horarioCocina && (
                  <div className="flex flex-wrap justify-between gap-2 px-5 py-3.5">
                    <dt className="font-medium">Cocina</dt>
                    <dd className="text-muted-foreground">{menuInfo.horarioCocina}</dd>
                  </div>
                )}
                {lista.map((h) => (
                  <div key={h.id} className="flex flex-wrap justify-between gap-2 px-5 py-3.5">
                    <dt className="font-medium">{h.nombre}</dt>
                    <dd className="text-muted-foreground">{h.valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {site.direccion && (
            <div>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wide text-brand uppercase">
                <MapPin className="size-4" /> Dónde estamos
              </h2>
              <p className="text-lg">{site.direccion}</p>
              {consulta && (
                <a href={enlaceMapa(consulta)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm underline underline-offset-4">
                  Cómo llegar
                </a>
              )}
            </div>
          )}
        </div>
        <Mapa query={consulta} titulo={`Ubicación de ${site.nombre}`} className="min-h-80" />
      </section>

      <section className="bg-brand-2 text-brand-2-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-14 text-center">
          <h2 className="font-display text-3xl font-semibold">Síguenos</h2>
          <p className="max-w-md opacity-85">Novedades, platos del día y más en nuestras redes.</p>
          <Redes redes={site.redes} itemClassName="size-12 bg-white/15 hover:bg-white/25" />
          <Button asChild variant="secondary" className="rounded-full">
            <Link href="/menu">Ver la carta completa</Link>
          </Button>
        </div>
      </section>

      <WhatsAppFlotante whatsapp={site.whatsapp} nombre={site.nombre} />
    </main>
  );
}
