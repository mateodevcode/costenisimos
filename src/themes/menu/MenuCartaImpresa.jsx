"use client";

// Menú "Carta impresa" — recrea las cartas físicas del local: hoja blanca por categoría con banda
// ondulada naranja, platos en plato oscuro, nombres en mayúsculas condensadas y precios en rosado.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Clock } from "lucide-react";
import { EASE } from "@/themes/marca/anim";
import { Letrero } from "@/themes/marca/autentico";
import { Ramo } from "@/themes/marca/Follaje";
import { BannerOndulado } from "@/themes/marca/formas";
import { Logo } from "@/themes/marca/Logo";
import { DetalleProducto, NotaMenu, Precio, SinResultados, horarioDeMenu, useFiltrosMenu } from "@/themes/menu/comun";
import { cn } from "@/lib/utils";

const anton = "font-anton uppercase tracking-wide";

function Plato({ p, site, onAbrir, indice }) {
  const reducir = useReducedMotion();
  return (
    <motion.li
      initial={reducir ? false : { opacity: 0, x: indice % 2 ? 24 : -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, ease: EASE, delay: (indice % 6) * 0.05 }}
    >
      <button
        type="button"
        onClick={() => onAbrir(p)}
        className="group flex w-full items-center gap-4 border-b border-dashed border-navy/15 py-4 text-left focus-visible:ring-2 focus-visible:ring-mango focus-visible:outline-none"
      >
        <span className="relative size-24 shrink-0 md:size-28">
          <span className="absolute inset-0 rounded-full bg-[#262626] shadow-[0_6px_14px_rgba(0,0,0,.25)] transition duration-500 group-hover:-rotate-12 group-hover:scale-105" />
          {p.image && (
            <span className="absolute inset-[7%] overflow-hidden rounded-full">
              <Image src={p.image} alt={p.nombre} fill sizes="112px" className={cn("object-cover", !p.disponibilidad && "grayscale")} />
            </span>
          )}
          {!p.disponibilidad && (
            <span className={`${anton} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded border-2 border-hibiscus bg-white/90 px-1.5 text-sm text-hibiscus`}>
              Agotado
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn(`${anton} block text-2xl leading-none text-navy`, !p.disponibilidad && "text-navy/50")}>{p.nombre}</span>
          {p.descripcion && <span className="mt-1.5 line-clamp-3 block text-sm leading-snug text-navy/75">{p.descripcion}</span>}
          <Precio valor={p.precio} site={site} className="mt-1.5 block font-anton text-2xl text-hibiscus" />
        </span>
      </button>
    </motion.li>
  );
}

export default function MenuCartaImpresa({ categorias, productos, ingredientes, site, menuInfo }) {
  const f = useFiltrosMenu({ categorias, productos, ingredientes, site });
  const reducir = useReducedMotion();
  const [seleccionado, setSeleccionado] = useState(null);
  const [activa, setActiva] = useState(null);
  const nav = useRef(null);
  const horario = horarioDeMenu(menuInfo, f.menu);

  // Resalta la categoría visible.
  useEffect(() => {
    const hojas = f.grupos.map((g) => document.getElementById(`carta-${g.categoria.id}`)).filter(Boolean);
    if (!hojas.length) return;
    const obs = new IntersectionObserver(
      (es) => {
        const v = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (v) setActiva(v.target.dataset.cat);
      },
      { rootMargin: "-160px 0px -55% 0px" }
    );
    hojas.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [f.grupos]);

  useEffect(() => {
    nav.current?.querySelector(`[data-id="${activa}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: reducir ? "auto" : "smooth" });
  }, [activa, reducir]);

  const ir = (id) => document.getElementById(`carta-${id}`)?.scrollIntoView({ behavior: reducir ? "auto" : "smooth", block: "start" });

  return (
    <main className="bg-cream font-figtree text-navy">
      <section className="relative overflow-hidden muro-olivo px-5 pt-14 pb-20 text-center text-cream" aria-labelledby="carta-titulo">
        <motion.div initial={reducir ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: EASE }} className="mx-auto w-[min(70vw,300px)]">
          <Logo className="w-full text-sun [filter:drop-shadow(3px_3px_0_#1B2A5C)]" titulo={site.nombre} conSubtitulo subtituloClassName="text-cream text-5xl -mt-3" />
        </motion.div>
        <h1 id="carta-titulo" className="mt-6">
          <Letrero texto="Nuestra carta" retraso={0.2} className={`${anton} text-[clamp(44px,7vw,96px)] leading-[0.95] text-[#1d2117]/90`} />
        </h1>
        {f.menusDisponibles.length > 0 && (
          <div role="tablist" aria-label="Tipo de menú" className="mx-auto mt-7 inline-flex rounded-full bg-black/20 p-1">
            {[{ id: "todos", nombre: "Todo" }, ...f.menusDisponibles].map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={f.menu === m.id}
                onClick={() => f.setMenu(m.id)}
                className={cn(`${anton} relative rounded-full px-5 py-2 text-lg`, f.menu === m.id ? "text-white" : "text-cream/75 hover:text-cream")}
              >
                {f.menu === m.id && <motion.span layoutId="pildora-impresa" className="absolute inset-0 rounded-full bg-mango" />}
                <span className="relative">{m.nombre}</span>
              </button>
            ))}
          </div>
        )}
        {horario && f.menu !== "todos" && (
          <p className="mt-3 flex items-center justify-center gap-2 text-sm text-cream/80">
            <Clock className="size-4" /> {horario}
          </p>
        )}
      </section>

      {f.grupos.length > 1 && (
        <nav ref={nav} aria-label="Categorías" className="sticky top-16 z-20 flex gap-2 overflow-x-auto bg-cream/95 px-5 py-3 shadow-sm backdrop-blur [scrollbar-width:none] md:justify-center">
          {f.grupos.map(({ categoria }) => (
            <button
              key={categoria.id}
              data-id={categoria.id}
              type="button"
              onClick={() => ir(categoria.id)}
              aria-current={activa === categoria.id ? "true" : undefined}
              className={cn(`${anton} shrink-0 rounded-full px-4 py-1.5 text-base transition`, activa === categoria.id ? "bg-mango text-white" : "bg-white text-navy hover:bg-mango/15")}
            >
              {categoria.nombre}
            </button>
          ))}
        </nav>
      )}

      <div className="mx-auto grid max-w-[1100px] gap-16 px-4 pt-20 pb-24">
        {f.grupos.length === 0 && <SinResultados onLimpiar={() => f.setMenu("todos")} />}
        {f.grupos.map(({ categoria, productos: lista }, i) => (
          <motion.section
            key={categoria.id}
            id={`carta-${categoria.id}`}
            data-cat={categoria.id}
            aria-labelledby={`h-${categoria.id}`}
            initial={reducir ? false : { opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative scroll-mt-36 overflow-hidden rounded-lg bg-white px-5 pb-10 shadow-[0_20px_50px_rgba(40,40,20,.12)] md:px-12"
          >
            <Ramo className={i % 2 ? "-bottom-28 -left-32" : "-top-24 -right-28"} size={300} paleta={i % 2 ? "rosa" : "calida"} girar={i % 2 ? 0 : 170} animar={false} sandia={i % 3 === 0} />
            <div className="relative -mt-2 pt-0">
              <BannerOndulado id={`h-${categoria.id}`} className="-mt-4 pt-10">
                {categoria.nombre}
              </BannerOndulado>
              <Logo className="mx-auto -mt-1 w-28 text-navy" titulo={site.nombre} />
            </div>
            <ul className="relative mt-6 grid gap-x-12 md:grid-cols-2">
              {lista.map((p, j) => (
                <Plato key={p.id} p={p} site={site} onAbrir={setSeleccionado} indice={j} />
              ))}
            </ul>
          </motion.section>
        ))}
        <NotaMenu menuInfo={menuInfo} />
      </div>

      <DetalleProducto
        producto={seleccionado}
        onClose={() => setSeleccionado(null)}
        mapaIngredientes={f.mapaIngredientes}
        categorias={categorias}
        site={site}
        clases={{ contenido: "rounded-xl bg-white text-navy", titulo: "font-anton text-3xl font-normal uppercase tracking-wide", precio: "font-anton text-2xl font-normal text-hibiscus", categoria: "text-mango font-bold" }}
      />
    </main>
  );
}
