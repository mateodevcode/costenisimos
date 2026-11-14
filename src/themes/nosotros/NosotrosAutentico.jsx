// Página "Nosotros" de la línea "Lo auténtico": fondo dorado (harvest gold) como To Home,
// dos fotos en collage y la historia del cliente en tres momentos.

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Heart, Sparkles, Users } from "lucide-react";
import { Escalonado, EscalonadoItem, GiroScroll, Revelar } from "@/themes/marca/anim";
import { Franja } from "@/themes/marca/autentico";
import { IMG } from "@/themes/marca/datos";
import { Ramo } from "@/themes/marca/Follaje";
import { SelloOndulado } from "@/themes/marca/formas";
import { Logo } from "@/themes/marca/Logo";

const DORADO = "bg-[#da9100]";
const titulo = "font-playfair font-bold leading-[1.05]";
const btn =
  "inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full px-7 text-base font-bold transition active:translate-y-px";

const HISTORIA = [
  {
    icono: Heart,
    titulo: "Nuestras raíces",
    texto:
      "Nacimos del amor por la gastronomía costeña, sus recetas tradicionales y esos sabores que nos recuerdan a casa.",
  },
  {
    icono: Sparkles,
    titulo: "Cada visita, especial",
    texto:
      "Queremos que cada visita sea una experiencia especial, donde la buena comida, la calidez y la tradición se encuentren en una misma mesa.",
  },
  {
    icono: Users,
    titulo: "La mesa que reúne",
    texto:
      "Porque creemos que la comida no solo alimenta, también reúne, crea recuerdos y nos conecta con nuestras raíces.",
  },
];

/**
 * Las dos fotos salen de Configuración → Nosotros → Galería (las dos primeras).
 * Si aún no hay, se usan fotos de marca.
 */
function fotos(site) {
  const propias = site?.nosotros?.imagenes ?? [];
  return [propias[0] || IMG.nosotros1, propias[1] || IMG.nosotros2];
}

export default function NosotrosAutentico({ site }) {
  const [foto1, foto2] = fotos(site);
  const nombre = site.nombre;

  return (
    <main className="font-montserrat text-[16px] leading-relaxed text-olive-deep">
      {/* HERO DORADO */}
      <section
        className={`relative isolate overflow-hidden ${DORADO} px-5 pt-16 pb-24 md:pt-24 md:pb-32`}
        aria-labelledby="nosotros-titulo"
      >
        <Ramo className="-top-24 -left-36" size={420} paleta="tropical" girar={90} sandia />
        <Ramo className="-right-40 -bottom-36 hidden md:block" size={460} paleta="rosa" girar={-80} animar={false} />

        <div className="relative mx-auto grid max-w-[1220px] items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
          <div className="text-center lg:text-left">
            <Revelar>
              <p className="text-xs font-bold tracking-[0.35em] text-navy uppercase">Nuestra historia</p>
              <h1 id="nosotros-titulo" className={`${titulo} mt-5 text-[clamp(38px,4.6vw,68px)] text-navy`}>
                En {nombre} llevamos{" "}
                <span className="text-cream [text-shadow:3px_3px_0_#1B2A5C]">el sabor de nuestra tierra</span> a cada
                plato.
              </h1>
            </Revelar>
            <Revelar retraso={0.2} className="mt-9 flex flex-wrap justify-center gap-3.5 lg:justify-start">
              <Link href="/menu" className={`${btn} bg-navy text-cream shadow-lg shadow-navy/25 hover:bg-navy-deep`}>
                Ver la carta <ArrowRight className="size-5" />
              </Link>
              <Link href="/#reservas" className={`${btn} border-2 border-navy text-navy hover:bg-navy/10`}>
                <CalendarCheck className="size-5" /> Reservar mesa
              </Link>
            </Revelar>
          </div>

          {/* Collage de dos fotos */}
          <div className="relative mx-auto w-full max-w-[520px] pb-16 sm:pb-10">
            <Revelar retraso={0.1} className="ml-auto w-[78%]">
              <div className="relative aspect-[4/5] rotate-2 overflow-hidden rounded-[22px] border-[10px] border-cream shadow-[0_30px_60px_rgba(27,42,92,.35)]">
                <Image src={foto1} alt={`Nuestro equipo en ${nombre}`} fill priority sizes="(max-width: 1024px) 80vw, 420px" className="object-cover" />
              </div>
            </Revelar>
            <Revelar retraso={0.35} className="absolute bottom-0 left-0 w-[52%]">
              <div className="relative aspect-square -rotate-3 overflow-hidden rounded-[18px] border-[8px] border-cream shadow-[0_24px_50px_rgba(27,42,92,.35)]">
                <Image src={foto2} alt={`Pedido To Home de ${nombre}`} fill sizes="(max-width: 1024px) 45vw, 280px" className="object-cover" />
              </div>
            </Revelar>
            <Revelar retraso={0.55} className="absolute -top-6 -left-2 w-[34%] sm:-left-6">
              <GiroScroll grados={20}>
                <SelloOndulado className="aspect-square w-full drop-shadow-xl">
                  <span className="grid justify-items-center px-3 text-center text-[10px] leading-tight font-bold tracking-[0.2em] text-navy uppercase sm:text-xs">
                    Full sabor
                    <span className={`${titulo} mt-0.5 block text-lg tracking-normal normal-case sm:text-2xl`}>a pueblo</span>
                  </span>
                </SelloOndulado>
              </GiroScroll>
            </Revelar>
          </div>
        </div>
      </section>

      {/* FRANJA */}
      <Franja
        items={["Tradición", "Sabor costeño", "Calidez", "Recetas de casa", "Raíces"]}
        className={`${titulo} -rotate-1 bg-navy py-4 text-2xl text-sun md:text-3xl`}
      />

      {/* LA HISTORIA EN TRES MOMENTOS */}
      <section className="relative overflow-hidden bg-cream px-5 py-24" aria-labelledby="historia-titulo">
        <div className="relative mx-auto max-w-[1100px]">
          <Revelar className="mx-auto max-w-[720px] text-center">
            <p className="text-xs font-bold tracking-[0.3em] text-mango uppercase">Lo que nos mueve</p>
            <h2 id="historia-titulo" className={`${titulo} mt-3 text-[clamp(32px,4.2vw,54px)] text-navy`}>
              Sabores que nos recuerdan a casa
            </h2>
          </Revelar>
          <Escalonado as="ol" className="mt-14 grid gap-6 md:grid-cols-3">
            {HISTORIA.map(({ icono: Icono, titulo: t, texto }, i) => (
              <EscalonadoItem
                key={t}
                as="li"
                className="relative flex flex-col gap-4 rounded-3xl bg-white p-7 shadow-[0_18px_40px_rgba(40,40,20,.08)]"
              >
                <span className={`${titulo} absolute top-5 right-6 text-6xl text-[#da9100]/25`} aria-hidden>
                  0{i + 1}
                </span>
                <span className="grid size-14 place-items-center rounded-full bg-[#da9100] text-white shadow-lg shadow-[#da9100]/30">
                  <Icono className="size-7" aria-hidden />
                </span>
                <h3 className={`${titulo} text-2xl text-navy`}>{t}</h3>
                <p className="text-olive-deep/85">{texto}</p>
              </EscalonadoItem>
            ))}
          </Escalonado>
        </div>
      </section>

      {/* CIERRE: FIRMA DE MARCA */}
      <section className="relative isolate overflow-hidden muro-olivo px-5 py-24 text-center text-cream" aria-labelledby="firma">
        <Ramo className="-top-28 -right-32" size={380} paleta="calida" girar={200} animar={false} />
        <Revelar className="relative mx-auto grid max-w-[900px] justify-items-center">
          <Logo className="w-[min(70vw,300px)] text-sun [filter:drop-shadow(3px_3px_0_#1B2A5C)]" titulo={nombre} />
          <p id="firma" className={`${titulo} mt-8 text-[clamp(34px,5vw,68px)]`}>
            {nombre}: <span className="text-[#f5b638]">full sabor a pueblo.</span>
          </p>
          <Link href="/menu" className={`${btn} mt-10 bg-[#da9100] text-white shadow-lg shadow-black/20 hover:brightness-95`}>
            Descubre nuestra carta <ArrowRight className="size-5" />
          </Link>
        </Revelar>
      </section>
    </main>
  );
}
