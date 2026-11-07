"use client";

// Menú "Papel kraft" — misma línea que la portada kraft: cada categoría es una hoja de papel con
// doble marco, lista con puntos guía y una polaroid del plato que aparece al pasar el cursor.

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE, TrazoDibujado } from "@/themes/marca/anim";
import { RamoTinta } from "@/themes/marca/Follaje";
import { DetalleProducto, NotaMenu, Precio, SinResultados, horarioDeMenu, useFiltrosMenu } from "@/themes/menu/comun";
import { cn } from "@/lib/utils";

const tit = "font-young text-balance leading-[1.12]";
const mano = "font-caveat font-bold text-hibiscus";

function Fila({ p, site, onAbrir }) {
  const [hover, setHover] = useState(false);
  return (
    <li className="relative" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <button type="button" onClick={() => onAbrir(p)} className="group flex w-full gap-3 rounded-md py-1.5 text-left focus-visible:ring-2 focus-visible:ring-hibiscus focus-visible:outline-none">
        {p.image && (
          <span className="relative mt-1 size-14 shrink-0 overflow-hidden rounded-[3px] bg-paper p-1 shadow-[0_2px_6px_rgba(60,40,10,.2)] md:hidden">
            <Image src={p.image} alt="" fill sizes="56px" className={cn("object-cover p-1", !p.disponibilidad && "grayscale")} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-3">
            <span className={cn(`${tit} text-xl`, !p.disponibilidad && "text-navy/50 line-through decoration-hibiscus")}>{p.nombre}</span>
            {!p.disponibilidad && <span className={`${mano} text-xl`}>agotado</span>}
            <span className="min-w-5 flex-1 -translate-y-1.5 border-b-2 border-dotted border-navy/45" aria-hidden />
            <Precio valor={p.precio} site={site} className="font-figtree text-[15px] font-semibold text-ink-soft" />
          </span>
          {p.descripcion && <span className="mt-0.5 line-clamp-2 block font-figtree text-[15.5px] text-ink-soft">{p.descripcion}</span>}
        </span>
      </button>
      <AnimatePresence>
        {hover && p.image && (
          <motion.figure
            initial={{ opacity: 0, rotate: -8, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, rotate: -4, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="pointer-events-none absolute top-1/2 -right-4 z-20 m-0 hidden w-44 -translate-y-1/2 translate-x-full rounded-[4px] bg-paper p-2.5 pb-3 shadow-[0_12px_28px_rgba(60,40,10,.25)] lg:block"
          >
            <span aria-hidden className="absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rotate-3 bg-sun/60" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2px]">
              <Image src={p.image} alt="" fill sizes="176px" className="object-cover" />
            </div>
          </motion.figure>
        )}
      </AnimatePresence>
    </li>
  );
}

export default function MenuKraft({ categorias, productos, ingredientes, site, menuInfo }) {
  const f = useFiltrosMenu({ categorias, productos, ingredientes, site });
  const reducir = useReducedMotion();
  const [seleccionado, setSeleccionado] = useState(null);
  const horario = horarioDeMenu(menuInfo, f.menu);
  const opcionesMenu = f.menusDisponibles.length ? [{ id: "todos", nombre: "todo el día" }, ...f.menusDisponibles.map((m) => ({ ...m, nombre: m.nombre.toLowerCase() }))] : [];

  const ir = (id) => document.getElementById(`hoja-${id}`)?.scrollIntoView({ behavior: reducir ? "auto" : "smooth", block: "start" });

  return (
    <main className="relative overflow-x-clip grano-kraft font-figtree text-navy">
      <section className="relative overflow-hidden px-5 pt-16 pb-10 text-center" aria-labelledby="carta-titulo">
        <RamoTinta className="top-4 -left-20 hidden md:block" size={260} />
        <RamoTinta className="top-4 -right-20 hidden md:block" size={260} espejo />
        <p className={`${mano} text-3xl`}>pa&apos; que te antojes</p>
        <h1 id="carta-titulo" className={`${tit} text-[clamp(48px,7vw,92px)]`}>
          La carta
        </h1>
        <TrazoDibujado color="#C9306A" className="mx-auto h-4 w-48" />
        {opcionesMenu.length > 0 && (
          <div role="tablist" aria-label="Tipo de menú" className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {opcionesMenu.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={f.menu === m.id}
                onClick={() => f.setMenu(m.id)}
                className={cn("relative font-caveat text-[26px] font-bold transition", f.menu === m.id ? "text-navy" : "text-navy/55 hover:text-navy")}
              >
                {m.nombre}
                {f.menu === m.id && (
                  <motion.span layoutId="subrayado-kraft" className="absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full bg-hibiscus" />
                )}
              </button>
            ))}
          </div>
        )}
        {horario && f.menu !== "todos" && <p className="mt-2 text-sm text-ink-soft">{horario}</p>}
        {f.grupos.length > 1 && (
          <nav aria-label="Categorías" className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-x-4 gap-y-1 text-[15px] font-semibold">
            {f.grupos.map(({ categoria }, i) => (
              <span key={categoria.id} className="flex items-center gap-4">
                {i > 0 && <span className="text-navy/40">·</span>}
                <button type="button" onClick={() => ir(categoria.id)} className="underline-offset-4 hover:text-hibiscus hover:underline">
                  {categoria.nombre}
                </button>
              </span>
            ))}
          </nav>
        )}
      </section>

      <div className="mx-auto grid max-w-[1000px] gap-12 px-5 pb-24">
        {f.grupos.length === 0 && <SinResultados onLimpiar={() => f.setMenu("todos")} />}
        {f.grupos.map(({ categoria, productos: lista }, i) => (
          <motion.section
            key={categoria.id}
            id={`hoja-${categoria.id}`}
            aria-labelledby={`t-${categoria.id}`}
            initial={reducir ? false : { opacity: 0, y: 40, rotate: i % 2 ? 1.5 : -1.5 }}
            whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 0.4 : -0.4 }}
            viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative scroll-mt-28 rounded-md bg-paper px-6 pt-12 pb-10 shadow-[0_1px_2px_rgba(60,40,10,.16),0_18px_40px_rgba(60,40,10,.12)] before:pointer-events-none before:absolute before:inset-3.5 before:rounded-[3px] before:border-[1.5px] before:border-navy after:pointer-events-none after:absolute after:inset-5 after:rounded-[2px] after:border after:border-navy/25 md:px-16"
          >
            <div className="relative text-center">
              <h2 id={`t-${categoria.id}`} className={`${tit} text-[clamp(30px,3.6vw,40px)]`}>
                {categoria.nombre}
              </h2>
              <p className={`${mano} text-2xl`}>{lista.length === 1 ? "una delicia" : `${lista.length} delicias`}</p>
            </div>
            <ul className="relative mt-6 grid gap-x-14 gap-y-4 md:grid-cols-2">
              {lista.map((p) => (
                <Fila key={p.id} p={p} site={site} onAbrir={setSeleccionado} />
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
        clases={{ contenido: "rounded-md bg-paper text-navy", titulo: "font-young text-3xl font-normal", precio: "text-hibiscus", categoria: "font-caveat text-xl normal-case tracking-normal text-hibiscus" }}
      />
    </main>
  );
}
