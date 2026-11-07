"use client";

import { useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Confirmación de borrado con aviso de cascada.
 * @param {{ abierto: boolean, onCerrar: () => void, titulo: string, descripcion: string, cascada?: string[], onConfirmar: () => Promise<void> }} props
 */
export function ConfirmarBorrado({ abierto, onCerrar, titulo, descripcion, cascada = [], onConfirmar }) {
  const [cargando, setCargando] = useState(false);

  const confirmar = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await onConfirmar();
      onCerrar();
    } catch {
      // onConfirmar ya informó el error; el diálogo queda abierto para reintentar.
    } finally {
      setCargando(false);
    }
  };

  return (
    <AlertDialog open={abierto} onOpenChange={(o) => !o && !cargando && onCerrar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descripcion}</AlertDialogDescription>
        </AlertDialogHeader>
        {cascada.length > 0 && (
          <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
            <ul className="grid gap-1">
              {cascada.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cargando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirmar} disabled={cargando} className="bg-destructive text-white hover:bg-destructive/90">
            {cargando && <Loader2 className="animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
