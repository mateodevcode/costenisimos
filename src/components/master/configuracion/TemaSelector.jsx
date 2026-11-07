"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/fetch-api";
import { cn } from "@/lib/utils";

/**
 * Selector genérico de tema: tarjetas con nombre, descripción, badge "Activo" y botón "Activar".
 * @param {{ temas: {id,nombre,descripcion}[], configKey: "home_theme"|"menu_theme", valorActual: string }} props
 */
export function TemaSelector({ temas, configKey, valorActual }) {
  const router = useRouter();
  const [activo, setActivo] = useState(valorActual);
  const [guardando, setGuardando] = useState(null);

  const activar = async (id) => {
    setGuardando(id);
    try {
      await fetchApi("/api/configuracion", { method: "PATCH", body: { updates: [{ key: configKey, value: id }] } });
      setActivo(id);
      toast.success("Diseño activado. Ya se ve en la carta pública.");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGuardando(null);
    }
  };

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {temas.map((t) => {
        const esActivo = t.id === activo;
        return (
          <motion.li key={t.id} layout className={cn("relative flex flex-col gap-3 rounded-xl border bg-card p-4 transition", esActivo && "border-primary ring-1 ring-primary")}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{t.nombre}</p>
                <p className="text-sm text-muted-foreground">{t.descripcion}</p>
              </div>
              {esActivo && (
                <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <Badge className="gap-1">
                    <CheckCircle2 className="size-3" /> Activo
                  </Badge>
                </motion.span>
              )}
            </div>
            <Button
              variant={esActivo ? "secondary" : "outline"}
              size="sm"
              className="mt-auto w-fit"
              disabled={esActivo || guardando !== null}
              onClick={() => activar(t.id)}
            >
              {guardando === t.id && <Loader2 className="animate-spin" />}
              {esActivo ? "En uso" : "Activar"}
            </Button>
          </motion.li>
        );
      })}
    </ul>
  );
}
