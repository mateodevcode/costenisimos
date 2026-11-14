"use client";

// Menú "Carta impresa" — recrea las cartas físicas del local: hoja blanca por categoría con banda
// ondulada naranja, platos en plato oscuro, nombres en mayúsculas condensadas y precios en rosado.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, Clock } from "lucide-react";
import { EASE } from "@/themes/marca/anim";
import { Letrero } from "@/themes/marca/autentico";
import { Ramo } from "@/themes/marca/Follaje";
import { BannerOndulado } from "@/themes/marca/formas";
import { Logo } from "@/themes/marca/Logo";
import { NotaMenu, Precio, SinResultados, horarioDeMenu, useFiltrosMenu } from "@/themes/menu/comun";
import { cn } from "@/lib/utils";

const titulo = "font-playfair font-bold";

function Plato({ p, site, abierto, onAlternar, indice, mapaIngredientes }) {
  const reducir = useReducedMotion();
  const ingredientes = p.ingredientes.map((id) => mapaIngredientes.get(id)).filter(Boolean);
  const panel = `plato-${p.id}`;
  return (
    <motion.li
      layout={reducir ? false : "position"}
      initial={reducir ? false : { opacity: 0, x: indice % 2 ? 24 : -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, ease: EASE, delay: (indice % 6) * 0.05 }}
      className={cn("border-b border-dashed border-navy/15", abierto && "md:col-span-2")}
    >
      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={abierto}
        aria-controls={panel}
        className="group flex w-full items-center gap-4 py-4 text-left focus-visible:ring-2 focus-visible:ring-mango focus-visible:outline-none"
      >
        <span className="relative size-24 shrink-0 md:size-28">
          <span className="absolute inset-0 rounded-full bg-[#262626] shadow-[0_6px_14px_rgba(0,0,0,.25)] transition duration-500 group-hover:-rotate-12 group-hover:scale-105" />
          {p.image && (
            <span className="absolute inset-[7%] overflow-hidden rounded-full">
              <Image src={p.image} alt="" fill sizes="112px" className={cn("object-cover", !p.disponibilidad && "grayscale")} />
            </span>
          )}
          {!p.disponibilidad && (
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded border-2 border-hibiscus bg-white/90 px-1.5 text-xs font-bold tracking-wider text-hibiscus uppercase">
              Agotado
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn(`${titulo} block text-2xl leading-tight text-navy`, !p.disponibilidad && "text-navy/50")}>{p.nombre}</span>
          {p.descripcion && !abierto && <span className="mt-1 line-clamp-2 block text-sm leading-snug text-navy/75">{p.descripcion}</span>}
          <Precio valor={p.precio} site={site} className={`${titulo} mt-1.5 block text-xl text-hibiscus`} />
        </span>
        <ChevronDown aria-hidden className={cn("size-6 shrink-0 text-mango transition duration-300", abierto && "rotate-180")} />
      </button>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            id={panel}
            key="detalle"
            initial={reducir ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reducir ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reducir ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="grid gap-6 pb-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#262626] shadow-[0_14px_30px_rgba(0,0,0,.18)]">
                {p.image && (
                  <Image src={p.image} alt={p.nombre} fill sizes="(max-width: 768px) 92vw, 500px" className={cn("object-cover", !p.disponibilidad && "grayscale")} />
                )}
              </div>
              <div className="grid content-start gap-4">
                {p.descripcion ? (
                  <p className="leading-relaxed whitespace-pre-line text-navy/85">{p.descripcion}</p>
                ) : (
                  <p className="text-sm text-navy/60">Pregúntanos por este plato.</p>
                )}
                {ingredientes.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-bold tracking-widest text-mango uppercase">Lleva</h3>
                    <ul className="flex flex-wrap gap-2">
                      {ingredientes.map((i) => (
                        <li key={i.id} className="flex items-center gap-2 rounded-full bg-cream py-1 pr-3 pl-1 text-sm">
                          {i.imagen && (
                            <span className="relative size-7 overflow-hidden rounded-full">
                              <Image src={i.imagen} alt="" fill sizes="28px" className="object-cover" />
                            </span>
                          )}
                          {i.nombre}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Precio valor={p.precio} site={site} className={`${titulo} text-3xl text-hibiscus`} />
                {!p.disponibilidad && (
                  <p className="rounded-lg bg-hibiscus/10 px-3 py-2 text-sm text-hibiscus">Este plato no está disponible en este momento.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export default function MenuCartaImpresa({ categorias, productos, ingredientes, site, menuInfo }) {
  const f = useFiltrosMenu({ categorias, productos, ingredientes, site });
  const reducir = useReducedMotion();
  const [abierto, setAbierto] = useState(null);
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
    <main className="bg-cream font-montserrat text-navy">
      <section className="relative overflow-hidden muro-olivo px-5 pt-14 pb-20 text-center text-cream" aria-labelledby="carta-titulo">
        <motion.div initial={reducir ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: EASE }} className="mx-auto w-[min(70vw,300px)]">
          <Logo className="w-full text-sun [filter:drop-shadow(3px_3px_0_#1B2A5C)]" titulo={site.nombre} conSubtitulo subtituloClassName="mt-1 font-montserrat text-2xl font-semibold tracking-wide text-cream" />
        </motion.div>
        <h1 id="carta-titulo" className="mt-6">
          <Letrero texto="Nuestra carta" retraso={0.2} className={`${titulo} text-[clamp(44px,7vw,96px)] leading-[1] text-[#1d2117]/90`} />
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
                className={cn("relative rounded-full px-5 py-2 text-base font-semibold", f.menu === m.id ? "text-white" : "text-cream/75 hover:text-cream")}
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
              className={cn("shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition", activa === categoria.id ? "bg-mango text-white" : "bg-white text-navy hover:bg-mango/15")}
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
                <Plato key={p.id} p={p} site={site} indice={j} abierto={abierto === p.id} onAlternar={() => setAbierto((a) => (a === p.id ? null : p.id))} mapaIngredientes={f.mapaIngredientes} />
              ))}
            </ul>
          </motion.section>
        ))}
        <NotaMenu menuInfo={menuInfo} />
      </div>
    </main>
  );
}
