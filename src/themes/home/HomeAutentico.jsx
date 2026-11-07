// Portada "Lo auténtico" — propuesta propia a partir del local: la pared verde oliva con el letrero
// "Aquí se saborea lo auténtico", la lámpara de mimbre, el sello naranja de la carta y la caja To Home.

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { Mapa, enlaceMapa } from "@/components/public/Mapa";
import { WhatsAppFlotante } from "@/components/public/WhatsAppFlotante";
import { IconoWhatsApp } from "@/components/public/iconos";
import { Escalonado, EscalonadoItem, GiroScroll, Revelar, TrazoDibujado } from "@/themes/marca/anim";
import { Franja, LamparaMimbre, Letrero } from "@/themes/marca/autentico";
import { CopiarNumero, ReservaWhatsApp } from "@/themes/marca/contacto";
import { IMG, consultaMapa, horarios, telefonoLegible, whatsappCon, whatsappPrincipal } from "@/themes/marca/datos";
import { Ramo } from "@/themes/marca/Follaje";
import { BannerOndulado, SelloOndulado } from "@/themes/marca/formas";
import { Logo } from "@/themes/marca/Logo";
import { formatearPrecio } from "@/lib/utils";

const anton = "font-anton uppercase leading-[0.95] tracking-wide";
const script = "font-yellowtail leading-none";
const btn = "inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full px-7 text-base font-bold transition active:translate-y-px";

export default function HomeAutentico({ site, menuInfo, destacados = [] }) {
  const wa = whatsappPrincipal(site);
  const consulta = consultaMapa(site);
  const listaHorarios = horarios(menuInfo);
  const categorias = [...new Set(destacados.map((d) => d.categoriaNombre).filter(Boolean))];
  const franja = categorias.length >= 3 ? categorias : ["Full sabor a pueblo", "Con amor para ti", "Aquí se saborea lo auténtico", "To Home"];

  return (
    <main className="font-figtree text-[17px] leading-relaxed text-olive-deep">
      {/* HERO: la pared del local */}
      <section className="relative isolate overflow-hidden muro-olivo text-cream" aria-labelledby="hero-titulo">
        <LamparaMimbre className="top-0 left-[8%] hidden md:block" />
        <div className="relative mx-auto grid max-w-[1220px] items-center gap-12 px-5 pt-20 pb-24 md:grid-cols-[1.2fr_.8fr] md:pt-28 md:pb-32">
          <div className="md:pl-[12%]">
            <h1 id="hero-titulo">
              <Letrero texto="Aquí se" className={`${anton} text-[clamp(56px,9vw,128px)] text-[#1d2117]/90 [text-shadow:0_1px_0_rgba(255,255,255,.08)]`} />
              <Letrero texto="saborea" retraso={0.15} className={`${anton} text-[clamp(56px,9vw,128px)] text-[#1d2117]/90`} />
              <span className={`${script} mt-2 block text-[clamp(64px,10vw,140px)] text-cream`}>
                <Revelar as="span" retraso={0.7} y={10} className="inline-block">
                  Lo auténtico.
                </Revelar>
              </span>
            </h1>
            <TrazoDibujado d="M6 12C80 4 200 2 330 10" viewBox="0 0 340 20" color="#FBF4E8" ancho={3} retraso={1.2} className="mt-1 ml-[18%] h-5 w-[min(70%,360px)]" />
            {site.descripcion && (
              <Revelar as="p" retraso={0.9} className="mt-8 max-w-[44ch] text-lg text-cream/80">
                {site.descripcion}
              </Revelar>
            )}
            <Revelar retraso={1} className="mt-9 flex flex-wrap gap-3.5">
              <Link href="/menu" className={`${btn} bg-mango text-white shadow-lg shadow-black/20 hover:bg-[#e07a14]`}>
                Ver la carta <ArrowRight className="size-5" />
              </Link>
              {wa.href && (
                <a href="#to-home" className={`${btn} border-2 border-cream/70 text-cream hover:bg-cream/10`}>
                  Pedir a domicilio
                </a>
              )}
            </Revelar>
          </div>

          <Revelar retraso={0.4} className="mx-auto w-[min(86vw,380px)]">
            <GiroScroll grados={18}>
              <SelloOndulado className="aspect-square w-full drop-shadow-2xl">
                <div className="grid justify-items-center gap-2 px-10 text-center">
                  <span className="text-xs font-bold tracking-[0.3em] text-navy uppercase">Full sabor a pueblo</span>
                  <Logo className="w-56 text-sun [filter:drop-shadow(3px_3px_0_#1B2A5C)]" titulo={site.nombre} conSubtitulo subtituloClassName="text-navy text-4xl -mt-2" />
                  <span className="text-xs font-bold tracking-[0.3em] text-navy uppercase">Est. 2025 · Colombia</span>
                </div>
              </SelloOndulado>
            </GiroScroll>
          </Revelar>
        </div>
      </section>

      {/* FRANJA */}
      <Franja items={franja} className={`${anton} -rotate-1 bg-mango py-4 text-2xl text-white md:text-3xl`} />

      {/* FAVORITOS como carta impresa */}
      <section className="relative overflow-hidden px-5 pt-28 pb-24" aria-labelledby="fav-titulo">
        <Ramo className="-top-24 -right-32 opacity-90" size={380} paleta="calida" girar={160} animar={false} sandia />
        <div className="relative mx-auto max-w-[1100px] rounded-[10px] bg-white px-6 pt-4 pb-14 shadow-[0_24px_60px_rgba(40,40,20,.15)] md:px-14">
          <BannerOndulado id="fav-titulo" className="-mt-16">
            Favoritos
          </BannerOndulado>
          {destacados.length > 0 ? (
            <Escalonado className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
              {destacados.map((p) => (
                <EscalonadoItem key={p.id} as="article" className="group flex items-center gap-5 border-b border-dashed border-olive/25 pb-6">
                  <div className="relative size-28 shrink-0 overflow-hidden rounded-full bg-[#2a2a2a] ring-4 ring-[#2a2a2a] transition duration-500 group-hover:-rotate-6 md:size-32">
                    <Image src={p.image} alt={p.nombre} fill sizes="128px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold tracking-widest text-mango uppercase">{p.categoriaNombre}</p>
                    <h3 className={`${anton} text-2xl text-navy md:text-3xl`}>{p.nombre}</h3>
                    {p.descripcion && <p className="mt-1 line-clamp-2 text-sm text-olive-deep/75">{p.descripcion}</p>}
                    <p className="mt-1.5 font-anton text-2xl text-hibiscus">{formatearPrecio(p.precio, site.moneda)}</p>
                  </div>
                </EscalonadoItem>
              ))}
            </Escalonado>
          ) : (
            <Revelar className="relative mt-10 aspect-[16/8] overflow-hidden rounded-lg">
              <Image src={IMG.cartas} alt="Cartas del restaurante sobre la barra" fill sizes="(max-width: 1100px) 90vw, 1000px" className="object-cover" />
            </Revelar>
          )}
          <div className="mt-12 text-center">
            <Link href="/menu" className={`${btn} bg-navy text-cream hover:bg-navy-deep`}>
              Ver la carta completa <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FRASE DE LA CAJA */}
      <section className="px-5 py-20" aria-labelledby="frase">
        <div className="mx-auto grid max-w-[1100px] items-center gap-12 md:grid-cols-[.8fr_1.2fr]">
          <Revelar className="mx-auto w-full max-w-[360px]">
            <div className="relative aspect-[3/4] -rotate-3 overflow-hidden rounded-[20px] border-[10px] border-white shadow-2xl">
              <Image src={IMG.empanadas} alt="Caja de empanadas con la frase: hay momentos que se saborean con el alma" fill sizes="360px" className="object-cover" />
            </div>
          </Revelar>
          <Revelar retraso={0.1} className="text-center md:text-left">
            <p id="frase" className={`${script} text-[clamp(44px,6vw,80px)] text-olive-deep`}>
              Hay momentos que se saborean con el alma.
            </p>
            <p className={`${script} mt-4 text-[clamp(32px,4vw,52px)] text-mango`}>que este sea uno de ellos.</p>
          </Revelar>
        </div>
      </section>

      {/* TO HOME */}
      <section id="to-home" className="relative isolate overflow-hidden bg-navy-deep px-5 py-28 text-cream" aria-labelledby="home-titulo">
        <Ramo className="-top-24 -left-32" size={460} paleta="tropical" girar={90} sandia />
        <Ramo className="-right-32 -bottom-28" size={460} paleta="rosa" girar={-90} />
        <div className="relative mx-auto grid max-w-[1000px] items-center justify-items-center gap-12 text-center md:grid-cols-2 md:text-left">
          <Revelar className="grid justify-items-center gap-1">
            <span className="text-sm font-bold tracking-[0.35em] text-sun uppercase">Full sabor a pueblo</span>
            <Logo className="w-[min(80vw,340px)] text-sun" titulo={site.nombre} />
            <h2 id="home-titulo" className={`${script} -mt-2 text-6xl text-sun`}>
              To Home
            </h2>
            <span className="mt-1 text-sm font-bold tracking-[0.35em] text-sun uppercase">Con amor para ti</span>
          </Revelar>
          <Revelar retraso={0.15} className="w-full max-w-md">
            <div className="overflow-hidden rounded-2xl bg-mango shadow-2xl shadow-black/40">
              <div className="px-7 pt-7 pb-5">
                <p className="text-lg text-white/90">Te lo llevamos calientico. Escríbenos, te confirmamos el valor y el tiempo de llegada.</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 bg-navy px-7 py-4">
                <span className={`${anton} text-xl text-sun`}>Realiza tu pedido</span>
                <span className="font-anton text-2xl tracking-wider text-white tabular-nums">{telefonoLegible(wa.numero)}</span>
              </div>
            </div>
            {wa.numero && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                <a
                  href={whatsappCon(site, `Hola ${site.nombre}, quiero hacer un pedido a domicilio.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btn} bg-[#25D366] text-white hover:brightness-95`}
                >
                  <IconoWhatsApp className="size-5" /> Pedir por WhatsApp
                </a>
                <CopiarNumero numero={wa.numero} className="text-sm font-bold text-sun underline underline-offset-4" />
              </div>
            )}
          </Revelar>
        </div>
      </section>

      {/* VISÍTANOS + RESERVA */}
      <section className="relative muro-olivo px-5 py-24 text-cream" aria-labelledby="visita-titulo">
        <div className="mx-auto grid max-w-[1220px] gap-10 lg:grid-cols-3">
          <Revelar>
            <h2 id="visita-titulo" className={`${anton} text-[clamp(44px,5vw,72px)] text-[#1d2117]/90`}>
              Ven a <span className={`${script} normal-case text-cream`}>visitarnos</span>
            </h2>
            {site.direccion && (
              <p className="mt-6 flex gap-3 text-lg">
                <MapPin className="mt-1 size-5 shrink-0 text-sun" />
                <span>
                  {site.direccion}
                  {consulta && (
                    <a href={enlaceMapa(consulta)} target="_blank" rel="noopener noreferrer" className="block font-bold text-sun underline underline-offset-4">
                      Cómo llegar
                    </a>
                  )}
                </span>
              </p>
            )}
            <ul className="mt-6 grid gap-2.5">
              {listaHorarios.map((h) => (
                <li key={h.id} className="flex gap-3">
                  <Clock className="mt-1 size-4 shrink-0 text-sun" />
                  <span>
                    <strong className="block">{h.nombre}</strong>
                    <span className="text-cream/75">{h.valor}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Revelar>
          <Revelar retraso={0.1} className="overflow-hidden rounded-2xl border-4 border-cream/15">
            <Mapa query={consulta} titulo={`Ubicación de ${site.nombre}`} className="h-full min-h-80 rounded-none border-0" />
          </Revelar>
          <Revelar retraso={0.2} id="reservas" className="rounded-2xl bg-cream p-6 text-olive-deep shadow-2xl md:p-8">
            <h3 className={`${anton} text-3xl text-navy`}>Reserva tu mesa</h3>
            <p className="mt-1 mb-5 text-sm text-olive-deep/75">Se abre WhatsApp con tu solicitud y te confirmamos.</p>
            <ReservaWhatsApp
              site={site}
              estilos={{
                form: "grid gap-3 sm:grid-cols-2",
                input: "h-11 rounded-lg border border-olive/30 bg-white px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-mango",
                label: "text-xs font-bold tracking-wider uppercase",
                boton: `${btn} bg-mango text-white hover:bg-[#e07a14]`,
              }}
            />
          </Revelar>
        </div>
      </section>

      <WhatsAppFlotante whatsapp={site.whatsapp} nombre={site.nombre} />
    </main>
  );
}
