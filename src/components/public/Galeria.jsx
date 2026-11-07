"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

/** Galería con lightbox animado (motion). Navegable con teclado. */
export function Galeria({ imagenes = [], titulo = "" }) {
  const [indice, setIndice] = useState(null);
  const total = imagenes.length;

  const cerrar = useCallback(() => setIndice(null), []);
  const mover = useCallback((d) => setIndice((i) => (i === null ? i : (i + d + total) % total)), [total]);

  useEffect(() => {
    if (indice === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowRight") mover(1);
      if (e.key === "ArrowLeft") mover(-1);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [indice, cerrar, mover]);

  if (!total) return null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {imagenes.map((src, i) => (
          <li key={src} className={i === 0 ? "col-span-2 row-span-2" : ""}>
            <button
              type="button"
              onClick={() => setIndice(i)}
              className="group relative block aspect-square w-full overflow-hidden rounded-2xl bg-muted focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
              aria-label={`Ver imagen ${i + 1} de ${total}`}
            >
              <motion.div layoutId={`galeria-${src}`} className="absolute inset-0">
                <Image src={src} alt={`${titulo} — imagen ${i + 1}`} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
              </motion.div>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {indice !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Imagen ${indice + 1} de ${total}`}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cerrar}
          >
            <motion.div
              layoutId={`galeria-${imagenes[indice]}`}
              className="relative h-[80dvh] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={imagenes[indice]} alt={`${titulo} — imagen ${indice + 1}`} fill sizes="100vw" className="object-contain" priority />
            </motion.div>
            <button type="button" onClick={cerrar} aria-label="Cerrar" autoFocus className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
              <X className="size-6" />
            </button>
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    mover(-1);
                  }}
                  aria-label="Imagen anterior"
                  className="absolute left-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="size-7" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    mover(1);
                  }}
                  aria-label="Imagen siguiente"
                  className="absolute right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                >
                  <ChevronRight className="size-7" />
                </button>
              </>
            )}
            <p className="absolute bottom-4 text-sm text-white/70">
              {indice + 1} / {total}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
