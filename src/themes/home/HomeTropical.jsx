// Portada "Tropical" — basada en la opción 1 de la plantilla (caja de domicilios azul con hojas).
// Bandas azul marino alternadas con papel crema, fotos en arco, sello girado y olas entre secciones.

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChefHat, Clock, Flame, MapPin, Truck } from "lucide-react";
import { Mapa, enlaceMapa } from "@/components/public/Mapa";
import { Redes } from "@/components/public/Redes";
import { WhatsAppFlotante } from "@/components/public/WhatsAppFlotante";
import { IconoInstagram, IconoWhatsApp } from "@/components/public/iconos";
import { Escalonado, EscalonadoItem, GiroScroll, Parallax, Revelar } from "@/themes/marca/anim";
import { CopiarNumero, ReservaWhatsApp } from "@/themes/marca/contacto";
import { IMG, consultaMapa, galeria, horarios, telefonoLegible, whatsappCon, whatsappPrincipal } from "@/themes/marca/datos";
import { Ramo } from "@/themes/marca/Follaje";
import { Arco, Ola } from "@/themes/marca/formas";
import { formatearPrecio } from "@/lib/utils";

const btn = "inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full border-2 px-7 font-nunito text-base font-bold transition active:translate-y-px";
const btnSol = `${btn} border-sun bg-sun text-navy hover:border-sun-hi hover:bg-sun-hi`;
const btnFantasma = `${btn} border-current bg-transparent hover:bg-white/10`;
const titulo = "font-fraunces fraunces-suave font-medium tracking-tight text-balance";

export default function HomeTropical({ site, menuInfo, destacados = [] }) {
  const wa = whatsappPrincipal(site);
  const consulta = consultaMapa(site);
  const listaHorarios = horarios(menuInfo);
  const fotos = galeria(site);
  const parrafos = site.nosotros?.parrafos?.length ? site.nosotros.parrafos : [site.descripcion].filter(Boolean);

  return (
    <main className="font-nunito text-[17px] leading-relaxed text-navy">
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-navy text-cream puntos-navy" aria-labelledby="hero-titulo">
        <Ramo className="-bottom-36 -left-36" size={520} paleta="tropical" />
        <Ramo className="-top-28 -right-36" size={460} paleta="rosa" girar={180} />
        <div className="relative mx-auto grid max-w-[1220px] items-center gap-14 px-5 pt-14 pb-36 md:grid-cols-[1.08fr_.92fr] md:pt-20">
          <Escalonado alCargar>
            <EscalonadoItem as="p" className={`${titulo} text-2xl text-sun italic`}>
              {site.slogan || "Full sabor a pueblo"}
            </EscalonadoItem>
            <EscalonadoItem as="h1" id="hero-titulo" className={`${titulo} mt-4 text-[clamp(46px,6.4vw,86px)] leading-[1.02] font-[450]`}>
              El sabor de la costa, <em className="font-normal">servido con cariño</em>.
            </EscalonadoItem>
            {site.descripcion && (
              <EscalonadoItem as="p" className="mt-6 max-w-[46ch] text-lg text-cream-soft">
                {site.descripcion}
              </EscalonadoItem>
            )}
            <EscalonadoItem className="mt-9 flex flex-wrap gap-3.5">
              <Link href="/menu" className={btnSol}>
                Ver la carta <ArrowRight className="size-5" />
              </Link>
              <a href="#reservas" className={btnFantasma}>
                Reservar mesa
              </a>
            </EscalonadoItem>
            <EscalonadoItem as="dl" className="mt-11 flex flex-wrap gap-x-8 gap-y-3 border-t border-cream/15 pt-6 text-[15px] text-cream-soft">
              {site.direccion && (
                <div>
                  <dt className="sr-only">Dirección</dt>
                  <dd className="m-0">
                    <strong className="block text-base text-cream">{site.direccion}</strong>
                    Te esperamos
                  </dd>
                </div>
              )}
              {wa.numero && (
                <div>
                  <dt className="sr-only">Pedidos</dt>
                  <dd className="m-0">
                    <strong className="block text-base text-cream">{telefonoLegible(wa.numero)}</strong>
                    WhatsApp y llamadas
                  </dd>
                </div>
              )}
            </EscalonadoItem>
          </Escalonado>

          <Revelar retraso={0.2} className="relative mx-auto w-[min(100%,460px)]">
            <Parallax distancia={30}>
              <span aria-hidden className="absolute -top-[18px] -right-[18px] bottom-[18px] left-[18px] rounded-t-full rounded-b-[36px] border-[1.5px] border-cream/45" />
              <Arco src={IMG.bolsa} alt={`Bolsa de ${site.nombre} con ilustraciones tropicales`} prioridad />
            </Parallax>
            <GiroScroll className="absolute bottom-14 -left-7 grid size-32 place-items-center rounded-full bg-hibiscus text-center text-[#FFF4F7] shadow-2xl shadow-black/30 sm:size-[132px]" base={-9} grados={14}>
              <span className={`${titulo} text-lg leading-tight italic`}>
                Hecho
                <br />a la costeña
              </span>
            </GiroScroll>
          </Revelar>
        </div>
        <Ola color="var(--color-paper)" />
      </section>

      {/* FAVORITOS */}
      <section className="px-5 py-24 md:py-28" aria-labelledby="fav-titulo">
        <div className="mx-auto max-w-[1220px]">
          <Revelar className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <h2 id="fav-titulo" className={`${titulo} text-[clamp(36px,4.4vw,56px)]`}>
              Favoritos de la casa
            </h2>
            <Link href="/menu" className="font-bold underline decoration-sun decoration-[3px] underline-offset-[7px] hover:decoration-navy">
              Ver la carta completa
            </Link>
          </Revelar>

          {destacados.length > 0 ? (
            <Escalonado className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {destacados.slice(0, 3).map((p, i) => (
                <EscalonadoItem key={p.id} as="article" className="group rounded-[28px] border border-line bg-[#FFFDF8] p-3.5 pb-7 shadow-sm transition hover:-translate-y-1.5 hover:shadow-xl hover:shadow-navy/10">
                  <div className="relative aspect-[1/1.02] overflow-hidden rounded-t-full rounded-b-[18px] bg-kraft">
                    <Image src={p.image} alt={p.nombre} fill sizes="(max-width: 640px) 90vw, 380px" className="object-cover transition duration-700 group-hover:scale-105" />
                    {i === 0 && <span className="absolute top-5 right-5 rounded-full bg-navy px-3 py-1.5 text-[13px] font-bold text-cream">El más pedido</span>}
                  </div>
                  <div className="px-2.5 pt-6">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className={`${titulo} text-[28px]`}>{p.nombre}</h3>
                      <span className="font-bold whitespace-nowrap tabular-nums">{formatearPrecio(p.precio, site.moneda)}</span>
                    </div>
                    {p.descripcion && <p className="mt-2.5 line-clamp-2 text-ink-soft">{p.descripcion}</p>}
                  </div>
                </EscalonadoItem>
              ))}
            </Escalonado>
          ) : (
            <Revelar className="grid items-center gap-8 rounded-[28px] border border-line bg-[#FFFDF8] p-6 md:grid-cols-2 md:p-10">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[18px]">
                <Image src={IMG.cartas} alt="Cartas del restaurante sobre la barra" fill sizes="(max-width: 768px) 90vw, 560px" className="object-cover" />
              </div>
              <div>
                <h3 className={`${titulo} text-3xl`}>Empanadas, salchipapas, fritos y más</h3>
                <p className="mt-3 text-ink-soft">Toda nuestra carta, con precios, está a un clic.</p>
                <Link href="/menu" className={`${btn} mt-6 border-navy bg-navy text-cream hover:bg-navy-deep`}>
                  Ver la carta
                </Link>
              </div>
            </Revelar>
          )}

          <Escalonado as="ul" className="mt-20 grid gap-10 border-t border-line pt-12 md:grid-cols-3">
            {[
              { icono: ChefHat, t: "Recetas de la costa", d: "Sazón de casa, sin atajos, como en el Caribe." },
              { icono: Flame, t: "Hecho al momento", d: "Fritos y empanadas recién salidos, doraditos." },
              { icono: Truck, t: `${site.nombre} To Home`, d: "Llega calientico a tu casa en nuestra caja tropical." },
            ].map(({ icono: Icono, t, d }) => (
              <EscalonadoItem as="li" key={t} className="flex items-start gap-4">
                <Icono className="size-11 shrink-0 text-navy" strokeWidth={1.6} />
                <div>
                  <h3 className={`${titulo} text-2xl`}>{t}</h3>
                  <p className="mt-1 text-ink-soft">{d}</p>
                </div>
              </EscalonadoItem>
            ))}
          </Escalonado>
        </div>
      </section>

      {/* NOSOTROS */}
      <section className="bg-paper-2 px-5 py-24 md:py-28" aria-labelledby="historia-titulo">
        <div className="mx-auto grid max-w-[1220px] items-center gap-14 md:grid-cols-[.9fr_1.1fr]">
          <Revelar className="mx-auto w-[min(100%,420px)]">
            <Arco src={fotos[0] ?? IMG.aviso} alt={`Aviso de ${site.nombre}`} borde="border-navy" />
          </Revelar>
          <Revelar retraso={0.1}>
            <h2 id="historia-titulo" className={`${titulo} text-[clamp(34px,4vw,52px)]`}>
              {site.nosotros?.titulo && site.nosotros.titulo !== "Nosotros" ? site.nosotros.titulo : "Un pedacito de la costa, aquí"}
            </h2>
            <div className="mt-5 grid gap-4 text-lg text-ink-soft">
              {parrafos.slice(0, 2).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <p className="mt-6 font-fraunces text-2xl text-hibiscus italic fraunces-suave">La familia {site.nombre}</p>
            <Link href="/nosotros" className="mt-6 inline-block font-bold underline decoration-sun decoration-[3px] underline-offset-[7px]">
              Conoce nuestra historia
            </Link>
          </Revelar>
        </div>
      </section>

      {/* TO HOME */}
      <section id="domicilios" className="relative isolate overflow-hidden bg-navy px-5 py-28 text-cream puntos-navy" aria-labelledby="home-titulo">
        <Ola color="var(--color-paper-2)" invertida />
        <Ramo className="-right-28 -bottom-32" size={420} paleta="rosa" sandia />
        <div className="relative mx-auto grid max-w-[1220px] items-center gap-14 md:grid-cols-2">
          <Revelar>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border-8 border-cream/10 shadow-2xl md:-rotate-2">
              <Image src={IMG.cajaToHome} alt={`Caja ${site.nombre} To Home con hojas tropicales`} fill sizes="(max-width: 768px) 90vw, 560px" className="object-cover" />
            </div>
          </Revelar>
          <div>
            <Revelar as="h2" id="home-titulo" className={`${titulo} text-[clamp(38px,4.6vw,60px)]`}>
              {site.nombre} <em className="text-sun">To Home</em>
            </Revelar>
            <Revelar as="p" retraso={0.05} className="mt-4 text-lg text-cream-soft">
              La costa llega a tu puerta. Preparamos tu pedido al momento y lo enviamos en nuestra caja tropical.
            </Revelar>
            <Escalonado as="ol" className="mt-8 grid gap-5">
              {[
                ["Elige en la carta", "Anota los platos que se te antojen."],
                ["Escríbenos por WhatsApp", "Envía tu pedido y la dirección de entrega."],
                ["Recíbelo en casa", "Te confirmamos el valor y el tiempo de llegada."],
              ].map(([t, d], i) => (
                <EscalonadoItem as="li" key={t} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sun font-fraunces text-xl font-semibold text-navy">{i + 1}</span>
                  <div>
                    <h3 className={`${titulo} text-xl`}>{t}</h3>
                    <p className="text-cream-soft">{d}</p>
                  </div>
                </EscalonadoItem>
              ))}
            </Escalonado>
            {wa.numero && (
              <Revelar className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href={whatsappCon(site, `Hola ${site.nombre}, quiero hacer un pedido a domicilio.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={btnSol}
                >
                  <IconoWhatsApp className="size-5" /> Pedir por WhatsApp
                </a>
                <span className="font-fraunces text-2xl tabular-nums">{telefonoLegible(wa.numero)}</span>
                <CopiarNumero numero={wa.numero} className="text-sm font-bold text-sun underline underline-offset-4" />
              </Revelar>
            )}
          </div>
        </div>
        <Ola color="var(--color-paper)" />
      </section>

      {/* RESERVAS */}
      <section id="reservas" className="px-5 py-24 md:py-28" aria-labelledby="reserva-titulo">
        <div className="mx-auto grid max-w-[1220px] gap-12 md:grid-cols-[.9fr_1.1fr]">
          <Revelar>
            <h2 id="reserva-titulo" className={`${titulo} text-[clamp(36px,4.4vw,56px)]`}>
              Reserva tu mesa
            </h2>
            <p className="mt-4 text-lg text-ink-soft">Cuéntanos cuándo vienes y te guardamos un puesto. Al enviar, se abre WhatsApp con tu solicitud y te confirmamos.</p>
            <ul className="mt-6 grid gap-3 text-ink-soft">
              <li>• Ideal para cumpleaños, almuerzos de familia y reuniones.</li>
              <li>• Grupos de más de 10 personas: escríbenos directamente.</li>
            </ul>
          </Revelar>
          <Revelar retraso={0.1} className="rounded-[28px] border border-line bg-[#FFFDF8] p-6 shadow-sm md:p-9">
            <ReservaWhatsApp
              site={site}
              estilos={{
                input: "h-12 rounded-2xl border border-line bg-paper px-4 text-base text-navy outline-none focus-visible:ring-2 focus-visible:ring-sun",
                label: "text-sm font-bold text-navy",
                boton: `${btn} border-navy bg-navy text-cream hover:bg-navy-deep`,
              }}
            />
          </Revelar>
        </div>
      </section>

      {/* VISÍTANOS */}
      <section className="bg-paper-2 px-5 py-24 md:py-28" aria-labelledby="visita-titulo">
        <div className="mx-auto grid max-w-[1220px] gap-12 md:grid-cols-2">
          <Revelar>
            <h2 id="visita-titulo" className={`${titulo} text-[clamp(36px,4.4vw,56px)]`}>
              Visítanos
            </h2>
            {site.direccion && (
              <p className="mt-5 flex gap-3 text-lg">
                <MapPin className="mt-1 size-5 shrink-0 text-hibiscus" />
                <span>
                  {site.direccion}
                  {consulta && (
                    <a href={enlaceMapa(consulta)} target="_blank" rel="noopener noreferrer" className="mt-1 block text-base font-bold underline decoration-sun decoration-2 underline-offset-4">
                      Cómo llegar
                    </a>
                  )}
                </span>
              </p>
            )}
            {listaHorarios.length > 0 && (
              <dl className="mt-8 divide-y divide-line rounded-[22px] border border-line bg-[#FFFDF8]">
                {listaHorarios.map((h) => (
                  <div key={h.id} className="flex flex-wrap justify-between gap-2 px-5 py-4">
                    <dt className="flex items-center gap-2 font-bold">
                      <Clock className="size-4 text-hibiscus" /> {h.nombre}
                    </dt>
                    <dd className="text-ink-soft">{h.valor}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Revelar>
          <Revelar retraso={0.1}>
            <Mapa query={consulta} titulo={`Ubicación de ${site.nombre}`} className="h-full min-h-80 rounded-[28px] border-line" />
          </Revelar>
        </div>
      </section>

      {/* REDES */}
      <section className="px-5 py-20" aria-labelledby="ig-titulo">
        <div className="mx-auto max-w-[1220px]">
          <Revelar className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 id="ig-titulo" className={`${titulo} text-[clamp(30px,3.6vw,44px)]`}>
              Síguenos y antójate
            </h2>
            {site.redes?.instagram && (
              <a href={site.redes.instagram} target="_blank" rel="noopener noreferrer" className={`${btn} border-navy text-navy hover:bg-navy hover:text-cream`}>
                <IconoInstagram className="size-5" /> Ver en Instagram
              </a>
            )}
          </Revelar>
          <Escalonado className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {fotos.slice(0, 4).map((src, i) => (
              <EscalonadoItem key={src} className="relative aspect-square overflow-hidden rounded-[22px] bg-kraft">
                <Image src={src} alt={`${site.nombre}, foto ${i + 1}`} fill sizes="(max-width: 768px) 45vw, 280px" className="object-cover transition duration-700 hover:scale-105" />
              </EscalonadoItem>
            ))}
          </Escalonado>
          <Redes redes={site.redes} className="mt-8 justify-center" itemClassName="bg-navy text-cream hover:bg-navy-deep" />
        </div>
      </section>

      <WhatsAppFlotante whatsapp={site.whatsapp} nombre={site.nombre} />
    </main>
  );
}
