"use client";

// Menú B — Lista vertical tipo carta impresa: secciones por categoría, precio alineado y detalle al tocar.

import { useState } from "react";
import { DetalleProducto, NotaMenu, Precio, SinResultados, TabsMenu, horarioDeMenu, useFiltrosMenu } from "@/themes/menu/comun";
import { cn } from "@/lib/utils";

export default function MenuB({ categorias, productos, ingredientes, site, menuInfo }) {
  const f = useFiltrosMenu({ categorias, productos, ingredientes, site });
  const [seleccionado, setSeleccionado] = useState(null);
  const horario = horarioDeMenu(menuInfo, f.menu);

  return (
    <main className="w-full bg-brand-2/5">
      <div className="mx-auto w-full max-w-3xl px-4 pt-10 pb-16 sm:px-8">
        <header className="mb-8 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-brand uppercase">Carta</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{site.nombre}</h1>
          {site.slogan && <p className="mt-2 text-muted-foreground italic">{site.slogan}</p>}
        </header>

        <div className="mb-10 flex flex-col items-center gap-2">
          <TabsMenu menus={f.menusDisponibles} valor={f.menu} onChange={f.setMenu} className="w-full sm:w-fit" />
          {horario && f.menu !== "todos" && <p className="text-sm text-muted-foreground">{horario}</p>}
        </div>

        {f.grupos.length === 0 ? (
          <SinResultados onLimpiar={() => f.setMenu("todos")} />
        ) : (
          <div className="grid gap-12">
            {f.grupos.map(({ categoria, productos: lista }) => (
              <section key={categoria.id} aria-labelledby={`cat-${categoria.id}`}>
                <h2 id={`cat-${categoria.id}`} className="mb-5 flex items-center gap-4 font-display text-2xl font-semibold">
                  <span className="h-px flex-1 bg-brand/30" />
                  {categoria.nombre}
                  <span className="h-px flex-1 bg-brand/30" />
                </h2>
                <ul className="grid gap-1">
                  {lista.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setSeleccionado(p)}
                        className={cn(
                          "w-full rounded-xl px-3 py-3 text-left transition hover:bg-background focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none",
                          !p.disponibilidad && "opacity-55"
                        )}
                      >
                        <span className="flex items-baseline gap-2">
                          <span className="font-medium">{p.nombre}</span>
                          {!p.disponibilidad && <span className="text-xs font-medium text-muted-foreground uppercase">(Agotado)</span>}
                          <span className="mx-1 flex-1 translate-y-[-3px] border-b border-dotted border-foreground/30" aria-hidden />
                          <Precio valor={p.precio} site={site} className="font-semibold" />
                        </span>
                        {p.descripcion && <span className="mt-1 line-clamp-2 block pr-16 text-sm text-muted-foreground">{p.descripcion}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <NotaMenu menuInfo={menuInfo} />
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
