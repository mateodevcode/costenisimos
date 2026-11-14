// Portada "Lo auténtico" — propuesta propia a partir del local: la pared verde oliva con el letrero
// "Aquí se saborea lo auténtico", la lámpara de mimbre, el sello naranja de la carta y la caja To Home.

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, HandPlatter, MapPin, Star, TreePalm, Users } from "lucide-react";
import { Mapa, enlaceMapa } from "@/components/public/Mapa";
import { WhatsAppFlotante } from "@/components/public/WhatsAppFlotante";
import { IconoWhatsApp } from "@/components/public/iconos";
import {
  Escalonado,
  EscalonadoItem,
  GiroScroll,
  Revelar,
  TrazoDibujado,
} from "@/themes/marca/anim";
import { Franja, LamparaMimbre, Letrero } from "@/themes/marca/autentico";
import { CopiarNumero, ReservaWhatsApp } from "@/themes/marca/contacto";
import {
  IMG,
  consultaMapa,
  horarios,
  telefonoLegible,
  whatsappCon,
  whatsappPrincipal,
} from "@/themes/marca/datos";
import { Ramo } from "@/themes/marca/Follaje";
import { BannerOndulado, SelloOndulado } from "@/themes/marca/formas";
import { Logo } from "@/themes/marca/Logo";
import { formatearPrecio } from "@/lib/utils";

const titulo = "font-playfair font-bold leading-[1.05]";
// Acentos (antes en cursiva Yellowtail): Montserrat, a pedido del cliente.
const script = "font-montserrat font-semibold leading-tight";
const btn =
  "inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full px-7 text-base font-bold transition active:translate-y-px";

const IDENTIDAD = [
  { icono: HandPlatter, texto: "Hecho para compartir." },
  { icono: TreePalm, texto: "Tradición y sabor costeño." },
  { icono: Users, texto: "Un lugar para disfrutar en familia y con amigos." },
];

export default function HomeAutentico({ site, menuInfo, destacados = [], promociones = [] }) {
  const wa = whatsappPrincipal(site);
  const consulta = consultaMapa(site);
  // "Ven a visitarnos": solo cocina + almuerzos (pedido del cliente).
  const listaHorarios = [
    ...horarios(menuInfo).filter((h) => h.id === "cocina"),
    { id: "almuerzos", nombre: "Almuerzos", valor: "11:00 a. m. – 3:00 p. m." },
  ];
  // Reseñas: enlace directo de Google si está configurado; si no, la ficha del local en Maps.
  const enlaceResenas = site.resenasUrl || enlaceMapa(consulta);
  const categorias = [
    ...new Set(destacados.map((d) => d.categoriaNombre).filter(Boolean)),
  ];
  const franja =
    categorias.length >= 3
      ? categorias
      : [
          "Full sabor a pueblo",
          "Con amor para ti",
          "Aquí se saborea lo auténtico",
          "To Home",
        ];

  return (
    <main className="font-montserrat text-[16px] leading-relaxed text-olive-deep">
      {/* HERO: la pared del local */}
      <section
        className="relative isolate overflow-hidden muro-olivo text-cream"
        aria-labelledby="hero-titulo"
      >
        <LamparaMimbre className="top-0 left-[8%] hidden md:block" />
        <div className="relative mx-auto grid max-w-[1220px] items-center gap-12 px-5 pt-20 pb-24 md:grid-cols-[1.2fr_.8fr] md:pt-28 md:pb-32">
          <div className="md:pl-[12%]">
            <h1 id="hero-titulo">
              <Letrero
                texto="El sabor de la costa"
                className={`${titulo} flex flex-wrap text-[clamp(48px,7vw,104px)] leading-[1.12] text-[#1d2117]/90 [text-shadow:0_1px_0_rgba(255,255,255,.08)]`}
              />
              <span
                className="mt-4 block font-montserrat text-[clamp(34px,4.8vw,68px)] leading-none font-semibold text-cream"
              >
                <Revelar
                  as="span"
                  retraso={0.7}
                  y={10}
                  className="inline-block"
                >
                  más cerca de ti.
                </Revelar>
              </span>
            </h1>
            <TrazoDibujado
              d="M6 12C80 4 200 2 330 10"
              viewBox="0 0 340 20"
              color="#FBF4E8"
              ancho={3}
              retraso={1.2}
              className="mt-1 ml-[18%] h-5 w-[min(70%,360px)]"
            />
            <Revelar
              as="p"
              retraso={0.9}
              className="mt-8 max-w-[46ch] text-lg text-cream/85"
            >
              Nacimos con el propósito de llevar el sabor de nuestra tierra a
              cada mesa. En {site.nombre} creemos que la comida sabe mejor
              cuando se comparte.
            </Revelar>
            <Revelar retraso={1} className="mt-9 flex flex-wrap gap-3.5">
              <Link
                href="/menu"
                className={`${btn} bg-mango text-white shadow-lg shadow-black/20 hover:bg-[#e07a14]`}
              >
                Ver la carta <ArrowRight className="size-5" />
              </Link>
              {wa.href && (
                <a
                  href="#to-home"
                  className={`${btn} border-2 border-cream/70 text-cream hover:bg-cream/10`}
                >
                  Pedir a domicilio
                </a>
              )}
            </Revelar>
          </div>

          <Revelar retraso={0.4} className="mx-auto w-[min(86vw,380px)]">
            <GiroScroll grados={18}>
              <SelloOndulado className="aspect-square w-full drop-shadow-2xl">
                <div className="grid justify-items-center gap-2 px-10 text-center">
                  <span className="text-xs font-bold tracking-[0.3em] text-navy uppercase">
                    Full sabor a pueblo
                  </span>
                  <Logo
                    className="w-56 text-sun [filter:drop-shadow(3px_3px_0_#1B2A5C)]"
                    titulo={site.nombre}
                  />
                  <span className="mt-3 text-xs font-bold tracking-[0.3em] text-navy uppercase">
                    Est. 2025 · Colombia
                  </span>
                </div>
              </SelloOndulado>
            </GiroScroll>
          </Revelar>
        </div>
      </section>

      {/* FRANJA */}
      <Franja
        items={franja}
        className={`${titulo} -rotate-1 bg-mango py-4 text-2xl text-white md:text-3xl`}
      />

      {/* IDENTIDAD DE MARCA */}
      <section
        className="relative overflow-hidden px-5 pt-24 pb-10"
        aria-labelledby="identidad-titulo"
      >
        <div className="mx-auto grid max-w-[1100px] items-center gap-12 md:grid-cols-[.9fr_1.1fr]">
          <Revelar className="mx-auto w-full max-w-[440px]">
            <div className="relative aspect-[4/5] rotate-2 overflow-hidden rounded-[20px] border-[10px] border-white shadow-2xl">
              <Image
                src={IMG.identidad}
                alt={`Clienta disfrutando una salchipapa en ${site.nombre}`}
                fill
                sizes="(max-width: 768px) 90vw, 440px"
                className="object-cover"
              />
            </div>
          </Revelar>
          <div className="text-center md:text-left">
            <Revelar>
              <p className="text-xs font-bold tracking-[0.3em] text-mango uppercase">
                Nuestra identidad
              </p>
              <h2
                id="identidad-titulo"
                className={`${titulo} mt-3 text-[clamp(34px,4.4vw,56px)] text-navy`}
              >
                En {site.nombre} nos gusta reunirnos{" "}
                <span className="font-montserrat font-semibold text-hibiscus">
                  alrededor del sabor.
                </span>
              </h2>
            </Revelar>
            <Escalonado as="ul" className="mt-10 grid gap-5">
              {IDENTIDAD.map(({ icono: Icono, texto }) => (
                <EscalonadoItem
                  key={texto}
                  as="li"
                  className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 text-left shadow-[0_10px_30px_rgba(40,40,20,.08)]"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-mango text-white">
                    <Icono className="size-6" aria-hidden />
                  </span>
                  <span className={`${titulo} text-xl text-olive-deep md:text-2xl`}>
                    {texto}
                  </span>
                </EscalonadoItem>
              ))}
            </Escalonado>
          </div>
        </div>
      </section>

      {/* LOS IMPERDIBLES como carta impresa */}
      <section
        className="relative overflow-hidden px-5 pt-28 pb-24"
        aria-labelledby="fav-titulo"
      >
        <Ramo
          className="-top-24 -right-32 opacity-90"
          size={380}
          paleta="calida"
          girar={160}
          animar={false}
          sandia
        />
        <div className="relative mx-auto max-w-[1100px] rounded-[10px] bg-white px-6 pt-4 pb-14 shadow-[0_24px_60px_rgba(40,40,20,.15)] md:px-14">
          <BannerOndulado id="fav-titulo" className="-mt-16">
            Los imperdibles
          </BannerOndulado>
          <p className={`${script} mt-1 text-center text-xl text-mango md:text-2xl`}>
            de {site.nombre}
          </p>
          {destacados.length > 0 ? (
            <Escalonado className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
              {destacados.map((p) => (
                <EscalonadoItem
                  key={p.id}
                  as="article"
                  className="group flex items-center gap-5 border-b border-dashed border-olive/25 pb-6"
                >
                  <div className="relative size-28 shrink-0 overflow-hidden rounded-full bg-[#2a2a2a] ring-4 ring-[#2a2a2a] transition duration-500 group-hover:-rotate-6 md:size-32">
                    <Image
                      src={p.image}
                      alt={p.nombre}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold tracking-widest text-mango uppercase">
                      {p.categoriaNombre}
                    </p>
                    <h3 className={`${titulo} text-2xl text-navy md:text-3xl`}>
                      {p.nombre}
                    </h3>
                    {p.descripcion && (
                      <p className="mt-1 line-clamp-2 text-sm text-olive-deep/75">
                        {p.descripcion}
                      </p>
                    )}
                    <p className={`${titulo} mt-1.5 text-2xl text-hibiscus`}>
                      {formatearPrecio(p.precio, site.moneda)}
                    </p>
                  </div>
                </EscalonadoItem>
              ))}
            </Escalonado>
          ) : (
            <Revelar className="relative mt-10 aspect-[16/8] overflow-hidden rounded-lg">
              <Image
                src={IMG.cartas}
                alt="Cartas del restaurante sobre la barra"
                fill
                sizes="(max-width: 1100px) 90vw, 1000px"
                className="object-cover"
              />
            </Revelar>
          )}
          <div className="mt-12 text-center">
            <Link
              href="/menu"
              className={`${btn} bg-navy text-cream hover:bg-navy-deep`}
            >
              Ver la carta completa <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* PROMOCIONES Y COMBOS */}
      {promociones.length > 0 && (
        <section
          id="promociones"
          className="relative isolate overflow-hidden bg-navy-deep px-5 py-24 text-cream"
          aria-labelledby="promos-titulo"
        >
          <Ramo
            className="-top-28 -right-36 opacity-80"
            size={420}
            paleta="calida"
            girar={200}
            animar={false}
          />
          <div className="relative mx-auto max-w-[1220px]">
            <Revelar className="text-center">
              <p className="text-xs font-bold tracking-[0.3em] text-sun uppercase">
                Para compartir
              </p>
              <h2
                id="promos-titulo"
                className={`${titulo} mt-3 text-[clamp(36px,5vw,64px)]`}
              >
                Promociones{" "}
                <span className={`${script} text-mango`}>
                  y combos
                </span>
              </h2>
            </Revelar>
            <Escalonado
              className={`mt-12 grid gap-7 ${promociones.length === 1 ? "mx-auto max-w-[560px]" : promociones.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}
            >
              {promociones.map((p) => (
                <EscalonadoItem
                  key={p.id}
                  as="article"
                  className="group flex flex-col overflow-hidden rounded-2xl bg-cream text-olive-deep shadow-2xl shadow-black/30"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={p.imagen}
                      alt={p.nombre}
                      fill
                      sizes="(max-width: 768px) 92vw, 400px"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    {p.etiqueta && (
                      <span className="absolute top-4 left-4 -rotate-3 rounded-full bg-mango px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                        {p.etiqueta}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <h3 className={`${titulo} text-2xl text-navy md:text-3xl`}>
                      {p.nombre}
                    </h3>
                    {p.descripcion && (
                      <p className="text-sm whitespace-pre-line text-olive-deep/80">
                        {p.descripcion}
                      </p>
                    )}
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
                      {p.precio !== null ? (
                        <p className="flex items-baseline gap-2">
                          <span className={`${titulo} text-3xl text-hibiscus`}>
                            {formatearPrecio(p.precio, site.moneda)}
                          </span>
                          {p.precioAntes !== null &&
                            p.precioAntes > p.precio && (
                              <s className="text-sm text-olive-deep/55">
                                {formatearPrecio(p.precioAntes, site.moneda)}
                              </s>
                            )}
                        </p>
                      ) : (
                        <span />
                      )}
                      {wa.numero && (
                        <a
                          href={whatsappCon(
                            site,
                            `Hola ${site.nombre}, quiero la promoción "${p.nombre}".`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-bold text-white transition hover:brightness-95"
                        >
                          <IconoWhatsApp className="size-4" /> La quiero
                        </a>
                      )}
                    </div>
                  </div>
                </EscalonadoItem>
              ))}
            </Escalonado>
          </div>
        </section>
      )}

      {/* FRASE DE LA CAJA */}
      <section className="px-5 py-20" aria-labelledby="frase">
        <div className="mx-auto grid max-w-[1100px] items-center gap-12 md:grid-cols-[.8fr_1.2fr]">
          <Revelar className="mx-auto w-full max-w-[360px]">
            <div className="relative aspect-[3/4] -rotate-3 overflow-hidden rounded-[20px] border-[10px] border-white shadow-2xl">
              <Image
                src={IMG.seaUnoDeEllos}
                alt={`Clienta disfrutando un plato en ${site.nombre}`}
                fill
                sizes="360px"
                className="object-cover"
              />
            </div>
          </Revelar>
          <Revelar retraso={0.1} className="text-center md:text-left">
            <p
              id="frase"
              className={`${script} text-[clamp(30px,3.6vw,48px)] text-olive-deep`}
            >
              Hay momentos que se saborean con el alma.
            </p>
            <p
              className={`${script} mt-4 text-[clamp(22px,2.4vw,32px)] text-mango`}
            >
              que este sea uno de ellos.
            </p>
          </Revelar>
        </div>
      </section>

      {/* TO HOME */}
      <section
        id="to-home"
        className="relative isolate overflow-hidden bg-[#da9100] px-5 py-28 text-olive-deep"
        aria-labelledby="home-titulo"
      >
        <Ramo
          className="-top-24 -left-32"
          size={460}
          paleta="tropical"
          girar={90}
          sandia
        />
        <Ramo
          className="-right-32 -bottom-28"
          size={460}
          paleta="rosa"
          girar={-90}
        />
        <div className="relative mx-auto grid max-w-[1000px] items-center justify-items-center gap-12 text-center md:grid-cols-2 md:text-left">
          <Revelar className="grid justify-items-center gap-1">
            <span className="text-sm font-bold tracking-[0.35em] text-navy uppercase">
              Full sabor a pueblo
            </span>
            <Logo
              className="w-[min(80vw,340px)] text-cream [filter:drop-shadow(3px_3px_0_#1B2A5C)]"
              titulo={site.nombre}
            />
            <h2
              id="home-titulo"
              className={`${script} mt-1 text-4xl font-bold text-navy md:text-5xl`}
            >
              To Home
            </h2>
            <span className="mt-1 text-sm font-bold tracking-[0.35em] text-navy uppercase">
              Con amor para ti
            </span>
          </Revelar>
          <Revelar retraso={0.15} className="w-full max-w-md">
            <div className="overflow-hidden rounded-2xl bg-mango shadow-2xl shadow-[#3a2a10]/25">
              <div className="px-7 pt-7 pb-5">
                <p className="text-lg text-white/90">
                  Te lo llevamos calientico. Escríbenos, te confirmamos el valor
                  y el tiempo de llegada.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 bg-navy px-7 py-4">
                <span className={`${titulo} text-xl text-sun`}>
                  Realiza tu pedido
                </span>
                <span className="font-playfair text-2xl font-bold tracking-wider text-white tabular-nums">
                  {telefonoLegible(wa.numero)}
                </span>
              </div>
            </div>
            {wa.numero && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                <a
                  href={whatsappCon(
                    site,
                    `Hola ${site.nombre}, quiero hacer un pedido a domicilio.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btn} bg-[#25D366] text-white hover:brightness-95`}
                >
                  <IconoWhatsApp className="size-5" /> Pedir por WhatsApp
                </a>
                <CopiarNumero
                  numero={wa.numero}
                  className="text-sm font-bold text-navy underline underline-offset-4"
                />
              </div>
            )}
          </Revelar>
        </div>
      </section>

      {/* RESEÑAS EN GOOGLE */}
      {enlaceResenas && (
        <section
          className="relative overflow-hidden bg-cream px-5 py-20"
          aria-labelledby="resenas-titulo"
        >
          <Revelar className="mx-auto grid max-w-[760px] justify-items-center text-center">
            <div className="flex gap-1.5 text-mango" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="size-8 fill-current md:size-9" />
              ))}
            </div>
            <p className="mt-6 text-xs font-bold tracking-[0.3em] text-mango uppercase">
              ¿Ya nos visitaste?
            </p>
            <h2
              id="resenas-titulo"
              className={`${titulo} mt-3 text-[clamp(34px,4.6vw,58px)] text-navy`}
            >
              Califícanos en Google
            </h2>
            <p className="mt-4 max-w-[48ch] text-lg text-olive-deep/80">
              Tu opinión nos ayuda a mejorar y a que más gente descubra el
              sabor de la costa. ¡Nos alegra el día leerte!
            </p>
            <a
              href={enlaceResenas}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn} mt-8 bg-navy text-cream shadow-lg shadow-navy/20 hover:bg-navy-deep`}
            >
              <Star className="size-5 fill-sun text-sun" aria-hidden />
              Dejar mi reseña en Google
            </a>
          </Revelar>
        </section>
      )}

      {/* VISÍTANOS + RESERVA */}
      <section
        className="relative muro-olivo px-5 py-24 text-cream"
        aria-labelledby="visita-titulo"
      >
        <div className="mx-auto grid max-w-[1220px] gap-10 lg:grid-cols-3">
          <Revelar>
            <h2
              id="visita-titulo"
              className={`${titulo} text-[clamp(44px,5vw,72px)] text-[#1d2117]/90`}
            >
              Ven a{" "}
              <span className={`${script} normal-case text-cream`}>
                visitarnos
              </span>
            </h2>
            {site.direccion && (
              <p className="mt-6 flex gap-3 text-lg">
                <MapPin className="mt-1 size-5 shrink-0 text-sun" />
                <span>
                  {site.direccion}
                  {consulta && (
                    <a
                      href={enlaceMapa(consulta)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block font-bold text-sun underline underline-offset-4"
                    >
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
          <Revelar
            retraso={0.1}
            className="overflow-hidden rounded-2xl border-4 border-cream/15"
          >
            <Mapa
              query={consulta}
              titulo={`Ubicación de ${site.nombre}`}
              className="h-full min-h-80 rounded-none border-0"
            />
          </Revelar>
          <Revelar
            retraso={0.2}
            id="reservas"
            className="rounded-2xl bg-cream p-6 text-olive-deep shadow-2xl md:p-8"
          >
            <h3 className={`${titulo} text-3xl text-navy`}>Reserva tu mesa</h3>
            <p className="mt-1 mb-5 text-sm text-olive-deep/75">
              Se abre WhatsApp con tu solicitud y te confirmamos.
            </p>
            <ReservaWhatsApp
              site={site}
              estilos={{
                // 1 columna en lg: la tarjeta queda angosta en la grilla de 3.
                form: "grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2",
                input:
                  "h-11 rounded-lg border border-olive/30 bg-white px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-mango",
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
