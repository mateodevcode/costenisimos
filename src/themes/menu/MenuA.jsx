"use client";

// Menú A — Cuadrícula con filtros: tabs por tipo de menú, chips de categoría, búsqueda y modal de detalle.

import { useState } from "react";
import { Clock, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  BadgeAgotado,
  DetalleProducto,
  ImagenProducto,
  NotaMenu,
  Precio,
  SinResultados,
  TabsMenu,
  horarioDeMenu,
  useFiltrosMenu,
} from "@/themes/menu/comun";

export default function MenuA({ categorias, productos, ingredientes, site, menuInfo }) {
  const f = useFiltrosMenu({ categorias, productos, ingredientes, site });
  const [seleccionado, setSeleccionado] = useState(null);
  const horario = horarioDeMenu(menuInfo, f.menu);

  const limpiar = () => {
    f.setBusqueda("");
    f.setCategoria("todas");
    f.setMenu("todos");
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-16">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium tracking-wide text-brand uppercase">{site.nombre}</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Nuestra carta</h1>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={f.busqueda}
            onChange={(e) => f.setBusqueda(e.target.value)}
            placeholder="Buscar plato o ingrediente"
            aria-label="Buscar en el menú"
            className="h-11 rounded-full pr-10 pl-9"
          />
          {f.busqueda && (
            <button
              type="button"
              onClick={() => f.setBusqueda("")}
              aria-label="Borrar búsqueda"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </header>

      <div className="sticky top-16 z-20 -mx-4 mb-6 grid gap-3 bg-background/90 px-4 py-3 backdrop-blur">
        <TabsMenu menus={f.menusDisponibles} valor={f.menu} onChange={f.setMenu} className="w-full sm:w-fit" />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" role="group" aria-label="Categorías">
          {[{ id: "todas", nombre: "Todas" }, ...categorias].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={f.categoria === c.id}
              onClick={() => f.setCategoria(c.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition",
                f.categoria === c.id ? "border-brand bg-brand text-brand-foreground" : "bg-background hover:bg-muted"
              )}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      {horario && f.menu !== "todos" && (
        <p className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4" /> {horario}
        </p>
      )}

      {f.filtrados.length === 0 ? (
        <SinResultados onLimpiar={limpiar} />
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {f.filtrados.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setSeleccionado(p)}
                className={cn(
                  "group flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none",
                  !p.disponibilidad && "opacity-60 grayscale"
                )}
              >
                <div className="relative">
                  <ImagenProducto src={p.image} alt={p.nombre} className="aspect-[4/3] w-full" prioridad={i < 3} />
                  {!p.disponibilidad && <BadgeAgotado className="absolute top-3 left-3" />}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-lg leading-snug font-semibold">{p.nombre}</h2>
                    <Precio valor={p.precio} site={site} className="shrink-0 font-semibold text-brand" />
                  </div>
                  {p.descripcion && <p className="line-clamp-2 text-sm text-muted-foreground">{p.descripcion}</p>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <NotaMenu menuInfo={menuInfo} />
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
