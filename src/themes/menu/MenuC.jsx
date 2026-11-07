"use client";

// Menú C — Editorial por categorías: cabecera con imagen de la categoría, rejilla de productos
// y navegación sticky (lateral en escritorio, horizontal en móvil) que sigue el scroll.

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BadgeAgotado, DetalleProducto, ImagenProducto, NotaMenu, Precio, SinResultados, TabsMenu, useFiltrosMenu } from "@/themes/menu/comun";

export default function MenuC({ categorias, productos, ingredientes, site, menuInfo }) {
  const f = useFiltrosMenu({ categorias, productos, ingredientes, site });
  const [seleccionado, setSeleccionado] = useState(null);
  const [activa, setActiva] = useState(null);
  const navMovil = useRef(null);

  // Scrollspy: marca la sección visible.
  useEffect(() => {
    const secciones = f.grupos.map((g) => document.getElementById(`seccion-${g.categoria.id}`)).filter(Boolean);
    if (!secciones.length) return;
    const obs = new IntersectionObserver(
      (entradas) => {
        const visible = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiva(visible.target.dataset.categoria);
      },
      { rootMargin: "-140px 0px -60% 0px" }
    );
    secciones.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [f.grupos]);

  // Mantiene visible el chip activo en la navegación móvil.
  useEffect(() => {
    navMovil.current?.querySelector(`[data-id="${activa}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [activa]);

  const ir = (id) => {
    document.getElementById(`seccion-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const enlaces = f.grupos.map((g) => g.categoria);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16">
      <header className="mb-8 grid gap-4 border-b pb-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">Menú</h1>
          {site.descripcion && <p className="mt-3 max-w-xl text-muted-foreground">{site.descripcion}</p>}
        </div>
        <TabsMenu menus={f.menusDisponibles} valor={f.menu} onChange={f.setMenu} className="w-full md:w-fit" />
      </header>

      {/* Navegación móvil */}
      <nav
        ref={navMovil}
        aria-label="Categorías"
        className="sticky top-16 z-20 -mx-4 mb-6 flex gap-2 overflow-x-auto border-b bg-background/95 px-4 py-3 backdrop-blur [scrollbar-width:none] lg:hidden"
      >
        {enlaces.map((c) => (
          <button
            key={c.id}
            data-id={c.id}
            type="button"
            onClick={() => ir(c.id)}
            aria-current={activa === c.id ? "true" : undefined}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition",
              activa === c.id ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            {c.nombre}
          </button>
        ))}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        {/* Navegación lateral */}
        <nav aria-label="Categorías" className="hidden lg:block">
          <ul className="sticky top-24 grid gap-1 border-l">
            {enlaces.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => ir(c.id)}
                  aria-current={activa === c.id ? "true" : undefined}
                  className={cn(
                    "-ml-px w-full border-l-2 py-1.5 pl-4 text-left text-sm transition",
                    activa === c.id ? "border-brand font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c.nombre}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-16">
          {f.grupos.length === 0 && <SinResultados onLimpiar={() => f.setMenu("todos")} />}
          {f.grupos.map(({ categoria, productos: lista }) => (
            <section
              key={categoria.id}
              id={`seccion-${categoria.id}`}
              data-categoria={categoria.id}
              aria-labelledby={`titulo-${categoria.id}`}
              className="scroll-mt-32"
            >
              <div className="relative mb-6 overflow-hidden rounded-3xl">
                <ImagenProducto src={categoria.imagen} alt="" className="aspect-[3/1] w-full sm:aspect-[4/1]" sizes="(max-width: 1024px) 100vw, 900px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <h2 id={`titulo-${categoria.id}`} className="absolute bottom-4 left-5 font-display text-3xl font-semibold text-white sm:text-4xl">
                  {categoria.nombre}
                </h2>
              </div>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                {lista.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSeleccionado(p)}
                      className={cn("group w-full text-left focus-visible:outline-none", !p.disponibilidad && "opacity-60")}
                    >
                      <div className="relative mb-3 overflow-hidden rounded-2xl ring-brand group-focus-visible:ring-2">
                        <ImagenProducto
                          src={p.image}
                          alt={p.nombre}
                          className="aspect-square w-full transition duration-500 group-hover:scale-[1.03]"
                        />
                        {!p.disponibilidad && <BadgeAgotado className="absolute top-3 left-3" />}
                      </div>
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-display text-lg font-semibold">{p.nombre}</h3>
                        <Precio valor={p.precio} site={site} className="shrink-0 text-sm font-semibold" />
                      </div>
                      {p.descripcion && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.descripcion}</p>}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <NotaMenu menuInfo={menuInfo} />
        </div>
      </div>

      <DetalleProducto
        producto={seleccionado}
        onClose={() => setSeleccionado(null)}
        mapaIngredientes={f.mapaIngredientes}
        categorias={categorias}
        site={site}
      />
    </main>
  );
}
