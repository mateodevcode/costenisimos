"use client";

// Piezas compartidas por los temas de menú. Solo dependen de props (sin fetch ni contexto global).

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MENU_TIPOS, menuPorHora, perteneceAMenu } from "@/lib/constants";
import { cn, formatearPrecio } from "@/lib/utils";

const normalizar = (s = "") =>
  String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Filtros de menú: tipo de menú (preseleccionado por hora), categoría y búsqueda de texto. */
export function useFiltrosMenu({ categorias, productos, ingredientes, site }) {
  const [menu, setMenu] = useState(() => {
    const porHora = menuPorHora(site?.zonaHoraria);
    // Solo preselecciona si hay productos de ese menú; si no, "todos".
    return productos.some((p) => (p.menus || []).includes(porHora)) ? porHora : "todos";
  });
  const [categoria, setCategoria] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const q = useDeferredValue(normalizar(busqueda.trim()));

  const mapaIngredientes = useMemo(() => new Map(ingredientes.map((i) => [i.id, i])), [ingredientes]);

  const filtrados = useMemo(
    () =>
      productos.filter((p) => {
        if (!perteneceAMenu(p, menu)) return false;
        if (categoria !== "todas" && p.categoria !== categoria) return false;
        if (!q) return true;
        const textoIng = p.ingredientes.map((id) => mapaIngredientes.get(id)?.nombre || "").join(" ");
        return normalizar(`${p.nombre} ${p.descripcion} ${textoIng}`).includes(q);
      }),
    [productos, menu, categoria, q, mapaIngredientes]
  );

  const grupos = useMemo(() => {
    const porCat = new Map(categorias.map((c) => [c.id, []]));
    for (const p of filtrados) porCat.get(p.categoria)?.push(p);
    return categorias.map((c) => ({ categoria: c, productos: porCat.get(c.id) || [] })).filter((g) => g.productos.length);
  }, [categorias, filtrados]);

  // Tabs de menú solo con tipos que tienen productos.
  const menusDisponibles = useMemo(
    () => MENU_TIPOS.filter((m) => productos.some((p) => (p.menus || []).includes(m.id))),
    [productos]
  );

  return { menu, setMenu, categoria, setCategoria, busqueda, setBusqueda, filtrados, grupos, menusDisponibles, mapaIngredientes };
}

export function Precio({ valor, site, className }) {
  return <span className={cn("tabular-nums", className)}>{formatearPrecio(valor, site?.moneda)}</span>;
}

export function ImagenProducto({ src, alt, className, sizes = "(max-width: 640px) 100vw, 33vw", prioridad = false }) {
  if (!src) return <div className={cn("bg-muted", className)} aria-hidden />;
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" priority={prioridad} />
    </div>
  );
}

export function BadgeAgotado({ className }) {
  return (
    <Badge variant="secondary" className={cn("bg-foreground/85 text-background", className)}>
      Agotado
    </Badge>
  );
}

/** Chips de tipo de menú. */
export function TabsMenu({ menus, valor, onChange, className }) {
  if (!menus.length) return null;
  const opciones = [{ id: "todos", nombre: "Todos" }, ...menus];
  return (
    <div role="tablist" aria-label="Tipo de menú" className={cn("flex gap-1 rounded-full bg-muted p-1", className)}>
      {opciones.map((m) => (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={valor === m.id}
          onClick={() => onChange(m.id)}
          className={cn(
            "flex-1 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition",
            valor === m.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {m.nombre}
        </button>
      ))}
    </div>
  );
}

/**
 * Modal de detalle del producto con sus ingredientes.
 * `clases` permite a cada tema vestirlo: { contenido, imagen, titulo, precio, categoria }.
 */
export function DetalleProducto({ producto, onClose, mapaIngredientes, categorias, site, clases = {} }) {
  const ingredientes = producto ? producto.ingredientes.map((id) => mapaIngredientes.get(id)).filter(Boolean) : [];
  const categoria = producto ? categorias.find((c) => c.id === producto.categoria) : null;
  return (
    <Dialog open={Boolean(producto)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={cn("max-h-[92dvh] gap-0 overflow-y-auto p-0 sm:max-w-lg", clases.contenido)}>
        {producto && (
          <>
            <div className="relative">
              <ImagenProducto src={producto.image} alt={producto.nombre} className={cn("aspect-[4/3] w-full", clases.imagen)} sizes="(max-width: 640px) 100vw, 512px" prioridad />
              {!producto.disponibilidad && <BadgeAgotado className="absolute top-3 left-3" />}
            </div>
            <div className="grid gap-4 p-6">
              <DialogHeader className="gap-1 text-left">
                {categoria && <p className={cn("text-xs font-medium tracking-wide text-muted-foreground uppercase", clases.categoria)}>{categoria.nombre}</p>}
                <DialogTitle className={cn("font-display text-2xl", clases.titulo)}>{producto.nombre}</DialogTitle>
                <DialogDescription asChild>
                  <div>
                    <Precio valor={producto.precio} site={site} className={cn("text-lg font-semibold text-brand", clases.precio)} />
                  </div>
                </DialogDescription>
              </DialogHeader>
              {producto.descripcion && <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{producto.descripcion}</p>}
              {ingredientes.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold">Ingredientes</h3>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {ingredientes.map((i) => (
                      <li key={i.id} className="flex items-center gap-2">
                        <ImagenProducto src={i.imagen} alt="" className="size-10 shrink-0 rounded-full" sizes="40px" />
                        <span className="min-w-0 text-sm leading-tight">
                          {i.nombre}
                          {i.cantidad && <span className="block text-xs text-muted-foreground">{i.cantidad}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!producto.disponibilidad && (
                <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">Este producto no está disponible en este momento.</p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

const CLAVE_HORARIO = { desayuno: "menuDesayuno", dia: "menuDia", noche: "menuNoche" };

/** Horario configurado (menu_info) para un tipo de menú. */
export function horarioDeMenu(menuInfo, menu) {
  return menuInfo?.[CLAVE_HORARIO[menu]] || "";
}

export function SinResultados({ onLimpiar }) {
  return (
    <div className="grid justify-items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
      <p className="font-medium">No encontramos productos con esos filtros.</p>
      {onLimpiar && (
        <button type="button" onClick={onLimpiar} className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

export function NotaMenu({ menuInfo }) {
  if (!menuInfo?.alergenos && !menuInfo?.horarioCocina) return null;
  return (
    <aside className="mt-12 grid gap-1 rounded-2xl bg-muted/60 p-5 text-sm text-muted-foreground">
      {menuInfo.horarioCocina && (
        <p>
          <span className="font-medium text-foreground">Horario de cocina:</span> {menuInfo.horarioCocina}
        </p>
      )}
      {menuInfo.alergenos && <p>{menuInfo.alergenos}</p>}
    </aside>
  );
}
