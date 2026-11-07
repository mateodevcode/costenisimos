"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Encabezado, Miniatura, Vacio } from "@/components/master/comun";
import { fetchApi } from "@/lib/fetch-api";
import { cn } from "@/lib/utils";

function Fila({ categoria, indice, productos }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: categoria.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5", isDragging && "z-10 shadow-lg ring-2 ring-ring")}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded-md p-1.5 text-muted-foreground hover:bg-muted active:cursor-grabbing"
        aria-label={`Mover ${categoria.nombre}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </button>
      <span className="w-6 text-center text-sm text-muted-foreground tabular-nums">{indice + 1}</span>
      <Miniatura src={categoria.imagen} className="w-16" />
      <span className="flex-1 truncate font-medium">{categoria.nombre}</span>
      <span className="text-xs text-muted-foreground">{productos} prod.</span>
    </li>
  );
}

export function OrdenarCategoriasView({ categorias, conteo }) {
  const router = useRouter();
  const [lista, setLista] = useState(categorias);
  const [guardando, setGuardando] = useState(false);
  const cambiado = lista.some((c, i) => c.id !== categorias[i]?.id);

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const alSoltar = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setLista((l) => arrayMove(l, l.findIndex((c) => c.id === active.id), l.findIndex((c) => c.id === over.id)));
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      await fetchApi("/api/categorias/ordenar", { method: "PUT", body: { orden: lista.map((c) => c.id) } });
      toast.success("Orden guardado. La carta ya muestra el nuevo orden.");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Encabezado titulo="Ordenar categorías" descripcion="Arrastra para definir el orden en que aparecen en la carta.">
        <Button variant="outline" onClick={() => setLista(categorias)} disabled={!cambiado || guardando}>
          <RotateCcw /> Deshacer
        </Button>
        <Button onClick={guardar} disabled={!cambiado || guardando}>
          {guardando ? <Loader2 className="animate-spin" /> : <Save />}
          Guardar orden
        </Button>
      </Encabezado>

      {lista.length === 0 ? (
        <Vacio titulo="No hay categorías" descripcion="Crea categorías en Catálogo para ordenarlas aquí." />
      ) : (
        <DndContext
          sensors={sensores}
          collisionDetection={closestCenter}
          onDragEnd={alSoltar}
          accessibility={{
            screenReaderInstructions: {
              draggable: "Para mover, presiona espacio o Enter, usa las flechas y vuelve a presionar espacio para soltar. Escape cancela.",
            },
          }}
        >
          <SortableContext items={lista.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <ol className="grid gap-2">
              {lista.map((c, i) => (
                <Fila key={c.id} categoria={c} indice={i} productos={conteo[c.id] || 0} />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
      {cambiado && <p className="mt-3 text-sm text-muted-foreground">Tienes cambios sin guardar.</p>}
    </div>
  );
}
