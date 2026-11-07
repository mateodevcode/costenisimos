"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Encabezado, Miniatura, Vacio, coincide } from "@/components/master/comun";
import { fetchApi } from "@/lib/fetch-api";
import { cn, formatearPrecio } from "@/lib/utils";

/** Switches por producto con actualización optimista y rollback si el servidor falla. */
export function DisponibilidadView({ categorias, productos, moneda }) {
  const router = useRouter();
  const [categoria, setCategoria] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [, startTransition] = useTransition();

  // Estado confirmado (servidor) + capa optimista encima: si la petición falla, el optimista se descarta solo.
  const [confirmados, setConfirmados] = useState(() => Object.fromEntries(productos.map((p) => [p.id, p.disponibilidad])));
  const [optimistas, aplicar] = useOptimistic(confirmados, (estado, { id, valor }) => ({ ...estado, [id]: valor }));
  const [pendientes, setPendientes] = useState(() => new Set());

  const nombreCategoria = useMemo(() => new Map(categorias.map((c) => [c.id, c.nombre])), [categorias]);
  const visibles = productos.filter(
    (p) => (categoria === "todas" || p.categoria === categoria) && coincide(`${p.nombre} ${nombreCategoria.get(p.categoria) ?? ""}`, busqueda)
  );
  const agotados = productos.filter((p) => optimistas[p.id] === false).length;

  const cambiar = (producto, valor) => {
    setPendientes((s) => new Set(s).add(producto.id));
    startTransition(async () => {
      aplicar({ id: producto.id, valor });
      try {
        await fetchApi(`/api/productos/${producto.id}/disponibilidad`, { method: "PATCH", body: { disponibilidad: valor } });
        setConfirmados((c) => ({ ...c, [producto.id]: valor }));
        toast.success(valor ? `${producto.nombre} disponible` : `${producto.nombre} marcado como agotado`);
        router.refresh();
      } catch (err) {
        toast.error(err.message || "No se pudo actualizar. Se revirtió el cambio.");
      } finally {
        setPendientes((s) => {
          const n = new Set(s);
          n.delete(producto.id);
          return n;
        });
      }
    });
  };

  return (
    <div>
      <Encabezado titulo="Disponibilidad" descripcion="Marca como agotado lo que no haya hoy. El cambio se ve al instante en la carta.">
        <Badge variant="secondary">{productos.length - agotados} disponibles</Badge>
        <Badge variant={agotados ? "destructive" : "secondary"}>{agotados} agotados</Badge>
      </Encabezado>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar producto" aria-label="Buscar producto" className="pl-9" />
        </div>
        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger className="w-full sm:w-56" aria-label="Filtrar por categoría">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las categorías</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {visibles.length === 0 ? (
        <Vacio titulo="No hay productos" descripcion={productos.length ? "Prueba con otro filtro." : "Crea productos en Catálogo para gestionarlos aquí."} />
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {visibles.map((p) => {
            const disponible = optimistas[p.id] !== false;
            const id = `disp-${p.id}`;
            return (
              <li key={p.id} className={cn("flex items-center gap-3 px-4 py-3", !disponible && "bg-muted/40")}>
                <Miniatura src={p.image} className={cn(!disponible && "opacity-50 grayscale")} />
                <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
                  <span className={cn("block truncate font-medium", !disponible && "text-muted-foreground line-through")}>{p.nombre}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {nombreCategoria.get(p.categoria) ?? "Sin categoría"} · {formatearPrecio(p.precio, moneda)}
                  </span>
                </label>
                <span className={cn("hidden text-xs font-medium sm:inline", disponible ? "text-green-700 dark:text-green-500" : "text-muted-foreground")}>
                  {disponible ? "Disponible" : "Agotado"}
                </span>
                <Switch id={id} checked={disponible} disabled={pendientes.has(p.id)} onCheckedChange={(v) => cambiar(p, v)} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
