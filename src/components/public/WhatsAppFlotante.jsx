"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { IconoWhatsApp } from "@/components/public/iconos";
import { enlaceWhatsApp } from "@/lib/utils";

/** Botón flotante de WhatsApp. Con varios números muestra un selector. */
export function WhatsAppFlotante({ whatsapp = [], nombre = "" }) {
  const [abierto, setAbierto] = useState(false);
  const numeros = whatsapp.map((w) => ({ ...w, href: enlaceWhatsApp(w.numero, w.mensaje) })).filter((w) => w.href);
  if (!numeros.length) return null;

  const clase =
    "fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-105 focus-visible:ring-4 focus-visible:ring-[#25D366]/40 focus-visible:outline-none sm:right-6 sm:bottom-6";

  if (numeros.length === 1) {
    return (
      <a href={numeros[0].href} target="_blank" rel="noopener noreferrer" aria-label={`Escribir por WhatsApp a ${nombre}`} className={clase}>
        <IconoWhatsApp className="size-7" />
      </a>
    );
  }

  return (
    <>
      {abierto && (
        <div className="fixed right-4 bottom-22 z-40 w-64 rounded-2xl border bg-popover p-2 text-popover-foreground shadow-xl sm:right-6 sm:bottom-24">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Escríbenos por WhatsApp</p>
          <ul>
            {numeros.map((w, i) => (
              <li key={`${w.numero}-${i}`}>
                <a href={w.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted">
                  <IconoWhatsApp className="size-4 text-[#25D366]" />
                  {w.numero}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button type="button" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto} aria-label="Contactar por WhatsApp" className={clase}>
        {abierto ? <X className="size-6" /> : <IconoWhatsApp className="size-7" />}
      </button>
    </>
  );
}
