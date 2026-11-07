"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/** Encabezado de una vista del panel. */
export function Encabezado({ titulo, descripcion, children }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{titulo}</h2>
        {descripcion && <p className="text-sm text-muted-foreground">{descripcion}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Miniatura({ src, alt = "", className, redonda = false }) {
  return (
    <div className={cn("relative size-11 shrink-0 overflow-hidden bg-muted", redonda ? "rounded-full" : "rounded-lg", className)}>
      {src && <Image src={src} alt={alt} fill sizes="48px" className="object-cover" />}
    </div>
  );
}

export function Vacio({ titulo, descripcion, children }) {
  return (
    <div className="grid justify-items-center gap-2 rounded-xl border border-dashed px-6 py-14 text-center">
      <p className="font-medium">{titulo}</p>
      {descripcion && <p className="max-w-sm text-sm text-muted-foreground">{descripcion}</p>}
      {children}
    </div>
  );
}

const normalizar = (s = "") =>
  String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export function coincide(texto, q) {
  if (!q) return true;
  return normalizar(texto).includes(normalizar(q.trim()));
}
