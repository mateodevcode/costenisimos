"use client";

import { useId, useState } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fortalezaPassword, requisitosPassword } from "@/lib/auth/password";
import { cn } from "@/lib/utils";

/** Label + control + mensaje de ayuda/error accesible. */
export function Campo({ label, error, ayuda, children, className, id: idProp }) {
  const generado = useId();
  const id = idProp || generado;
  const descId = `${id}-desc`;
  const hijo = typeof children === "function" ? children({ id, "aria-describedby": error || ayuda ? descId : undefined, "aria-invalid": Boolean(error) || undefined }) : children;
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {hijo}
      {(error || ayuda) && (
        <p id={descId} className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
          {error || ayuda}
        </p>
      )}
    </div>
  );
}

export function PasswordInput({ className, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-10", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

const COLORES = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-green-600"];

export function MedidorPassword({ password }) {
  const { puntaje, etiqueta } = fortalezaPassword(password);
  const requisitos = requisitosPassword(password);
  if (!password) return null;
  return (
    <div className="grid gap-2" aria-live="polite">
      <div className="flex gap-1" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn("h-1.5 flex-1 rounded-full bg-muted", i < puntaje && COLORES[puntaje])} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Fortaleza: <span className="font-medium text-foreground">{etiqueta}</span>
      </p>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {requisitos.map((r) => (
          <li key={r.id} className={cn("flex items-center gap-1", r.cumple ? "text-green-700 dark:text-green-500" : "text-muted-foreground")}>
            {r.cumple ? <Check className="size-3" /> : <X className="size-3" />}
            {r.texto}
          </li>
        ))}
      </ul>
    </div>
  );
}
