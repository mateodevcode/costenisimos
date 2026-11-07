"use client";

// Menú "Tropical" — misma línea que la portada tropical: cabecera azul con hojas, pestañas por
// categoría con indicador animado y tarjetas con foto en arco que se reacomodan al filtrar.

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Clock, Search, X } from "lucide-react";
import { Ramo } from "@/themes/marca/Follaje";
import { Ola } from "@/themes/marca/formas";
import { EASE } from "@/themes/marca/anim";
import { DetalleProducto, NotaMenu, Precio, SinResultados, horarioDeMenu, useFiltrosMenu } from "@/themes/menu/comun";
import { cn } from "@/lib/utils";

const tit = "font-fraunces fraunces-suave font-medium tracking-tight text-balance";

function Pestanas({ opciones, valor, onChange, grupo, className, oscuro = false }) {
  return (
    <div role="tablist" className={cn("flex gap-1 overflow-x-auto [scrollbar-width:none]", className)}>
      {opciones.map((o) => {
        const activo = valor === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={activo}
            onClick={() => onChange(o.id)}
            className={cn(
              "relative shrink-0 rounded-full px-5 py-2.5 text-[15px] font-bold whitespace-nowrap transition-colors",
              activo ? "text-navy" : oscuro ? "text-cream/80 hover:text-cream" : "text-navy/70 hover:text-navy"
            )}
          >
            {activo && <motion.span layoutId={grupo} className="absolute inset-0 rounded-full bg-sun" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative">{o.nombre}</span>
          </button>
        );
      })}
    </div>
  );
}

function Tarjeta({ p, site, onAbrir, prioridad }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <button
        type="button"
        onClick={() => onAbrir(p)}
        className={cn(
          "group flex h-full w-full flex-col rounded-[28px] border border-line bg-[#FFFDF8] p-3 pb-6 text-left shadow-sm transition hover:-translate-y-1.5 hover:shadow-xl hover:shadow-navy/10 focus-visible:ring-4 focus-visible:ring-sun focus-visible:outline-none",
          !p.disponibilidad && "opacity-60"
        )}
      >
        <div className="relative aspect-square overflow-hidden rounded-t-full rounded-b-[18px] bg-kraft">
          {p.image && <Image src={p.image} alt={p.nombre} fill sizes="(max-width: 640px) 90vw, 300px" className={cn("object-cover transition duration-700 group-hover:scale-105", !p.disponibilidad && "grayscale")} priority={prioridad} />}
          {!p.disponibilidad && <span className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-navy px-3 py-1 text-xs font-bold text-cream">Agotado</span>}
        </div>
        <div className="flex flex-1 flex-col px-2 pt-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className={`${tit} text-2xl leading-tight`}>{p.nombre}</h3>
            <Precio valor={p.precio} site={site} className="shrink-0 font-nunito font-extrabold text-hibiscus" />
          </div>
          {p.descripcion && <p className="mt-2 line-clamp-2 font-nunito text-[15px] text-ink-soft">{p.descripcion}</p>}
        </div>
      </button>
    </motion.li>
  );
}

export default function MenuTropical({ categorias, productos, ingredientes, site, menuInfo }) {
  const f = useFiltrosMenu({ categorias, productos, ingredientes, site });
  const reducir = useReducedMotion();
  const [seleccionado, setSeleccionado] = useState(null);
  const horario = horarioDeMenu(menuInfo, f.menu);
  const opcionesMenu = f.menusDisponibles.length ? [{ id: "todos", nombre: "Todo el día" }, ...f.menusDisponibles] : [];
  const opcionesCat = [{ id: "todas", nombre: "Todo" }, ...categorias.filter((c) => productos.some((p) => p.categoria === c.id))];
  const grupos = f.categoria === "todas" ? f.grupos : f.grupos.filter((g) => g.categoria.id === f.categoria);

  return (
    <main className="font-nunito text-navy">
      <section className="relative isolate overflow-hidden bg-navy px-5 pt-14 pb-28 text-cream puntos-navy" aria-labelledby="carta-titulo">
        <Ramo className="-top-28 -right-32" size={400} paleta="rosa" girar={180} />
        <Ramo className="-bottom-40 -left-40 hidden md:block" size={420} />
        <div className="relative mx-auto max-w-[1220px]">
          <motion.p initial={reducir ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`${tit} text-2xl text-sun italic`}>
            {site.nombre}
          </motion.p>
          <motion.h1
            id="carta-titulo"
            initial={reducir ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.8, ease: EASE }}
            className={`${tit} mt-2 text-[clamp(48px,7vw,92px)] leading-none font-[450]`}
          >
            La carta
          </motion.h1>
          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {opcionesMenu.length > 0 && (
              <LayoutGroup id="menus">
                <Pestanas opciones={opcionesMenu} valor={f.menu} onChange={f.setMenu} grupo="pildora-menu" oscuro className="rounded-full bg-white/10 p-1" />
              </LayoutGroup>
            )}
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-cream/60" />
              <input
                type="search"
                value={f.busqueda}
                onChange={(e) => f.setBusqueda(e.target.value)}
                placeholder="¿Qué se te antoja?"
                aria-label="Buscar en la carta"
                className="h-12 w-full rounded-full border border-cream/20 bg-white/10 pr-10 pl-11 text-cream placeholder:text-cream/50 outline-none focus-visible:ring-2 focus-visible:ring-sun"
              />
              {f.busqueda && (
                <button type="button" onClick={() => f.setBusqueda("")} aria-label="Borrar búsqueda" className="absolute top-1/2 right-4 -translate-y-1/2 text-cream/70">
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
          {horario && f.menu !== "todos" && (
            <p className="mt-4 flex items-center gap-2 text-sm text-cream-soft">
              <Clock className="size-4" /> {horario}
            </p>
          )}
        </div>
        <Ola color="var(--color-paper)" />
      </section>

      <div className="sticky top-16 z-20 bg-paper/90 py-3 backdrop-blur">
        <LayoutGroup id="categorias">
          <Pestanas opciones={opcionesCat} valor={f.categoria} onChange={f.setCategoria} grupo="pildora-cat" className="mx-auto max-w-[1220px] px-5" />
        </LayoutGroup>
      </div>

      <div className="mx-auto max-w-[1220px] px-5 pt-8 pb-24">
        {grupos.length === 0 ? (
          <SinResultados
            onLimpiar={() => {
              f.setBusqueda("");
              f.setCategoria("todas");
              f.setMenu("todos");
            }}
          />
        ) : (
          <LayoutGroup id="platos">
            {grupos.map(({ categoria, productos: lista }, gi) => (
              <motion.section key={categoria.id} layout className="mb-16" aria-labelledby={`cat-${categoria.id}`}>
                <div className="mb-7 flex items-end justify-between gap-4 border-b border-line pb-3">
                  <h2 id={`cat-${categoria.id}`} className={`${tit} text-[clamp(30px,3.6vw,44px)]`}>
                    {categoria.nombre}
                  </h2>
                  <span className="text-sm font-bold text-ink-soft">{lista.length} {lista.length === 1 ? "opción" : "opciones"}</span>
                </div>
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <AnimatePresence mode="popLayout">
                    {lista.map((p, i) => (
                      <Tarjeta key={p.id} p={p} site={site} onAbrir={setSeleccionado} prioridad={gi === 0 && i < 4} />
                    ))}
                  </AnimatePresence>
                </ul>
              </motion.section>
            ))}
          </LayoutGroup>
        )}
        <NotaMenu menuInfo={menuInfo} />
      </div>

      <DetalleProducto
        producto={seleccionado}
        onClose={() => setSeleccionado(null)}
        mapaIngredientes={f.mapaIngredientes}
        categorias={categorias}
        site={site}
        clases={{ contenido: "rounded-[28px] border-line bg-paper text-navy", imagen: "rounded-t-[28px]", titulo: "font-fraunces fraunces-suave text-3xl", precio: "text-hibiscus font-extrabold", categoria: "text-hibiscus" }}
      />
    </main>
  );
}
