// Portada "Papel kraft" — basada en la opción 2 de la plantilla (bolsa kraft con tinta azul).
// Fondo de papel con grano, polaroids con cinta, follaje a línea y frases a mano.

import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { Mapa, enlaceMapa } from "@/components/public/Mapa";
import { Redes } from "@/components/public/Redes";
import { WhatsAppFlotante } from "@/components/public/WhatsAppFlotante";
import { IconoWhatsApp } from "@/components/public/iconos";
import { Escalonado, EscalonadoItem, GiroScroll, Revelar, TrazoDibujado } from "@/themes/marca/anim";
import { CopiarNumero, ReservaWhatsApp } from "@/themes/marca/contacto";
import { IMG, consultaMapa, galeria, horarios, telefonoLegible, whatsappCon, whatsappPrincipal } from "@/themes/marca/datos";
import { RamoTinta } from "@/themes/marca/Follaje";
import { formatearPrecio } from "@/lib/utils";

const tit = "font-young text-balance leading-[1.12]";
const mano = "font-caveat text-[28px] font-bold text-hibiscus";
const btn = "inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full border-2 border-navy px-7 font-figtree text-base font-bold transition active:translate-y-px";
const btnTinta = `${btn} bg-navy text-paper hover:bg-navy-deep`;
const btnLinea = `${btn} bg-transparent text-navy hover:bg-navy hover:text-paper`;

function Polaroid({ src, alt, pie, giro = 0, arco = false, cinta = true, className = "", sizes = "(max-width: 760px) 45vw, 300px", prioridad = false }) {
  return (
    <figure
      className={`relative m-0 rounded-[4px] bg-paper p-3 pb-3.5 shadow-[0_1px_2px_rgba(60,40,10,.18),0_12px_28px_rgba(60,40,10,.14)] transition-transform duration-500 hover:rotate-0 hover:scale-[1.03] ${arco ? "rounded-t-full" : ""} ${className}`}
      style={{ rotate: `${giro}deg` }}
    >
      {cinta && <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-21 -translate-x-1/2 -rotate-3 bg-sun/55" />}
      <div className={`relative overflow-hidden ${arco ? "aspect-[3/4] rounded-t-full rounded-b-[2px]" : "aspect-[4/5] rounded-[2px]"}`}>
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" priority={prioridad} />
      </div>
      {pie && <figcaption className="mt-2 font-caveat text-2xl leading-tight font-bold text-navy">{pie}</figcaption>}
    </figure>
  );
}

function Ornamento() {
  return (
    <div className="flex items-center justify-center gap-4 text-navy" aria-hidden>
      <span className="h-[1.5px] w-[min(28vw,220px)] bg-navy" />
      <svg viewBox="0 0 56 28" className="h-7 w-14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M4 14C14 4 22 4 28 14S42 24 52 14" />
        <circle cx="28" cy="14" r="3" fill="currentColor" />
      </svg>
      <span className="h-[1.5px] w-[min(28vw,220px)] bg-navy" />
    </div>
  );
}

export default function HomeKraft({ site, menuInfo, destacados = [] }) {
  const wa = whatsappPrincipal(site);
  const consulta = consultaMapa(site);
  const listaHorarios = horarios(menuInfo);
  const fotos = galeria(site);
  const parrafos = site.nosotros?.parrafos?.length ? site.nosotros.parrafos : [site.descripcion].filter(Boolean);

  return (
    <main className="font-figtree text-[17px] leading-relaxed text-navy">
      {/* HERO */}
      <section className="relative overflow-hidden px-5 pt-16 pb-24 text-center md:pt-20" aria-labelledby="hero-titulo">
        <RamoTinta className="top-10 -left-16 hidden sm:block" />
        <RamoTinta className="top-10 -right-16 hidden sm:block" espejo />
        <Escalonado alCargar className="relative mx-auto max-w-5xl">
          <EscalonadoItem as="p" className={mano}>
            ¡Ajá, llegó el sabor!
          </EscalonadoItem>
          <EscalonadoItem as="h1" id="hero-titulo" className={`${tit} mx-auto mt-3 max-w-[14ch] text-[clamp(44px,6.6vw,88px)] tracking-tight`}>
            {site.slogan ? `${site.slogan}.` : "Cocina costeña hecha en casa."}
          </EscalonadoItem>
          <EscalonadoItem className="mx-auto mt-1 w-56">
            <TrazoDibujado color="#C9306A" className="h-4 w-full" retraso={0.7} />
          </EscalonadoItem>
          {site.descripcion && (
            <EscalonadoItem as="p" className="mx-auto mt-5 max-w-[50ch] text-lg text-ink-soft">
              {site.descripcion}
            </EscalonadoItem>
          )}
          <EscalonadoItem className="mt-8 flex flex-wrap justify-center gap-3.5">
            <Link href="/menu" className={btnTinta}>
              Ver la carta
            </Link>
            <a href="#reservas" className={btnLinea}>
              Reservar mesa
            </a>
          </EscalonadoItem>
        </Escalonado>

        <Escalonado alCargar className="relative mx-auto mt-16 grid max-w-[980px] grid-cols-2 items-center gap-5 md:grid-cols-[1fr_1.15fr_1fr] md:gap-7">
          <EscalonadoItem className="md:translate-y-6">
            <Polaroid src={IMG.bolsa} alt={`Bolsa kraft de ${site.nombre}`} pie="pa' llevar" giro={-5} />
          </EscalonadoItem>
          <EscalonadoItem className="col-span-2 row-start-1 mx-auto w-full max-w-[300px] md:col-span-1 md:row-start-auto md:max-w-none">
            <Polaroid src={fotos[0] ?? IMG.aviso} alt={`Aviso de ${site.nombre}`} arco cinta={false} prioridad />
          </EscalonadoItem>
          <EscalonadoItem className="md:translate-y-6">
            <Polaroid src={IMG.cajaMesa} alt={`Caja ${site.nombre} To Home`} pie="to Home" giro={4} />
          </EscalonadoItem>
        </Escalonado>
      </section>

      <Ornamento />

      {/* FAVORITOS */}
      {destacados.length > 0 && (
        <section className="px-5 py-24 text-center" aria-labelledby="fav-titulo">
          <div className="mx-auto max-w-[1100px]">
            <Revelar as="p" className={mano}>
              los consentidos
            </Revelar>
            <Revelar as="h2" id="fav-titulo" className={`${tit} text-[clamp(38px,4.8vw,60px)]`}>
              Favoritos de la casa
            </Revelar>
            <Escalonado className="mt-14 grid gap-12 md:grid-cols-3">
              {destacados.slice(0, 3).map((p) => (
                <EscalonadoItem key={p.id} as="article" className="group">
                  <div className="relative mx-auto aspect-square w-[min(100%,240px)] overflow-hidden rounded-full bg-paper shadow-[inset_0_0_0_1.5px_#1F2E63] ring-[10px] ring-paper outline outline-[1.5px] outline-offset-[10px] outline-navy/30 transition duration-500 group-hover:rotate-6">
                    <Image src={p.image} alt={p.nombre} fill sizes="240px" className="rounded-full object-cover p-1" />
                  </div>
                  <h3 className={`${tit} mt-8 text-[28px]`}>{p.nombre}</h3>
                  {p.descripcion && <p className="mx-auto mt-2 line-clamp-2 max-w-[30ch] text-ink-soft">{p.descripcion}</p>}
                  <span className="mt-2.5 block font-semibold text-ink-soft tabular-nums">{formatearPrecio(p.precio, site.moneda)}</span>
                </EscalonadoItem>
              ))}
            </Escalonado>
            <Link href="/menu" className={`${btnLinea} mt-14`}>
              Ver toda la carta
            </Link>
          </div>
        </section>
      )}

      {/* HISTORIA */}
      <section className="px-5 py-24" aria-labelledby="historia-titulo">
        <div className="mx-auto grid max-w-[1100px] items-center gap-14 md:grid-cols-[1.1fr_.9fr]">
          <Revelar>
            <p className={mano}>nuestra historia</p>
            <h2 id="historia-titulo" className={`${tit} text-[clamp(36px,4.6vw,56px)]`}>
              {site.nosotros?.titulo && site.nosotros.titulo !== "Nosotros" ? site.nosotros.titulo : "Un pedacito de la costa, aquí"}
            </h2>
            {parrafos.slice(0, 2).map((p, i) => (
              <p key={i} className="mt-5 max-w-[56ch] text-lg text-ink-soft">
                {p}
              </p>
            ))}
            <p className="mt-6 font-caveat text-4xl font-bold text-navy">La familia {site.nombre}</p>
            <ul className="mt-9 grid gap-6 sm:grid-cols-3">
              {[
                ["Sazón de verdad", "Recetas costeñas sin atajos."],
                ["Hecho al momento", "Todo sale recién hecho."],
                ["Alegría en la mesa", "Atención cálida, como en casa."],
              ].map(([t, d]) => (
                <li key={t} className="border-t-[1.5px] border-navy pt-3.5">
                  <h3 className={`${tit} text-xl`}>{t}</h3>
                  <p className="mt-1 text-[15.5px] leading-normal text-ink-soft">{d}</p>
                </li>
              ))}
            </ul>
          </Revelar>
          <Revelar retraso={0.1} className="mx-auto w-full max-w-[420px] md:row-start-auto">
            <GiroScroll grados={4} base={2}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-lg border-[10px] border-paper shadow-[0_18px_40px_rgba(60,40,10,.18)]">
                <Image src={IMG.pared} alt={`Pared de ${site.nombre}: aquí se saborea lo auténtico`} fill sizes="420px" className="object-cover" />
              </div>
            </GiroScroll>
          </Revelar>
        </div>
      </section>

      {/* DOMICILIOS */}
      <section id="domicilios" className="bg-navy px-5 py-24 text-paper" aria-labelledby="home-titulo">
        <div className="mx-auto grid max-w-[1100px] items-center gap-14 md:grid-cols-2">
          <Revelar>
            <p className="font-caveat text-[28px] font-bold text-sun">con amor para ti</p>
            <h2 id="home-titulo" className={`${tit} text-[clamp(36px,4.6vw,56px)]`}>
              La costa llega a tu puerta
            </h2>
            <p className="mt-4 text-lg text-cream-soft">Escríbenos por WhatsApp, te confirmamos el valor y el tiempo de llegada, y lo recibes calientico en nuestra caja.</p>
            {wa.numero && (
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={whatsappCon(site, `Hola ${site.nombre}, quiero hacer un pedido a domicilio.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btn} border-sun bg-sun text-navy hover:bg-sun-hi`}
                >
                  <IconoWhatsApp className="size-5" /> Pedir a domicilio
                </a>
                <span className="font-young text-2xl tabular-nums">{telefonoLegible(wa.numero)}</span>
                <CopiarNumero numero={wa.numero} className="text-sm font-bold text-sun underline underline-offset-4" />
              </div>
            )}
          </Revelar>
          <Revelar retraso={0.1} className="mx-auto w-full max-w-[380px]">
            <Polaroid src={IMG.cajaToHome} alt={`Caja ${site.nombre} To Home`} pie="¡llegó tu pedido!" giro={3} sizes="380px" />
          </Revelar>
        </div>
      </section>

      {/* RESERVAS */}
      <section id="reservas" className="px-5 py-24" aria-labelledby="reserva-titulo">
        <div className="relative mx-auto max-w-[860px] rounded-md bg-paper p-8 shadow-[0_1px_2px_rgba(60,40,10,.16),0_18px_40px_rgba(60,40,10,.12)] before:pointer-events-none before:absolute before:inset-3.5 before:rounded-[3px] before:border-[1.5px] before:border-navy after:pointer-events-none after:absolute after:inset-5 after:rounded-[2px] after:border after:border-navy/25 md:p-14">
          <Revelar className="relative text-center">
            <p className={mano}>te guardamos la mesa</p>
            <h2 id="reserva-titulo" className={`${tit} text-[clamp(34px,4.4vw,52px)]`}>
              Reserva tu mesa
            </h2>
            <p className="mx-auto mt-3 max-w-[48ch] text-ink-soft">Al enviar se abre WhatsApp con tu solicitud y te confirmamos.</p>
          </Revelar>
          <div className="relative mt-8">
            <ReservaWhatsApp
              site={site}
              estilos={{
                input: "h-12 border-0 border-b-2 border-dotted border-navy/45 bg-transparent px-1 text-lg text-navy outline-none focus-visible:border-solid focus-visible:border-hibiscus",
                label: "font-caveat text-2xl font-bold text-navy",
                boton: `${btnTinta} mt-2`,
              }}
            />
          </div>
        </div>
      </section>

      {/* VISÍTANOS */}
      <section className="px-5 pb-24" aria-labelledby="visita-titulo">
        <div className="mx-auto grid max-w-[1100px] items-start gap-12 md:grid-cols-2">
          <Revelar>
            <p className={mano}>aquí estamos</p>
            <h2 id="visita-titulo" className={`${tit} text-[clamp(36px,4.6vw,56px)]`}>
              Visítanos
            </h2>
            {site.direccion && (
              <p className="mt-5 flex gap-3 text-lg">
                <MapPin className="mt-1 size-5 shrink-0 text-hibiscus" />
                <span>
                  {site.direccion}
                  {consulta && (
                    <a href={enlaceMapa(consulta)} target="_blank" rel="noopener noreferrer" className="block font-caveat text-2xl font-bold text-hibiscus">
                      cómo llegar →
                    </a>
                  )}
                </span>
              </p>
            )}
            <ul className="mt-6 grid gap-3">
              {listaHorarios.map((h) => (
                <li key={h.id} className="flex items-baseline gap-3">
                  <Clock className="size-4 shrink-0 translate-y-0.5 text-navy" />
                  <span className="font-semibold">{h.nombre}</span>
                  <span className="min-w-5 flex-1 -translate-y-1 border-b-2 border-dotted border-navy/45" />
                  <span className="text-ink-soft">{h.valor}</span>
                </li>
              ))}
            </ul>
            <Redes redes={site.redes} className="mt-8" itemClassName="border-[1.5px] border-navy text-navy hover:bg-navy hover:text-paper" />
          </Revelar>
          <Revelar retraso={0.1} className="rounded-[4px] bg-paper p-3 shadow-[0_12px_28px_rgba(60,40,10,.14)] md:rotate-1">
            <Mapa query={consulta} titulo={`Ubicación de ${site.nombre}`} className="min-h-80 rounded-[2px] border-0" />
          </Revelar>
        </div>
      </section>

      <WhatsAppFlotante whatsapp={site.whatsapp} nombre={site.nombre} />
    </main>
  );
}
