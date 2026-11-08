"use client";

// Piezas animadas de la línea "Lo auténtico": lámpara de mimbre, letrero que se escribe y franja continua.

import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/themes/marca/anim";
import { cn } from "@/lib/utils";

/** Lámpara de mimbre colgante (como la del local) que se mece y proyecta luz cálida. */
export function LamparaMimbre({ className }) {
  const reducir = useReducedMotion();
  const tejido = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div className={cn("pointer-events-none absolute", className)} aria-hidden>
      {/* resplandor */}
      <motion.div
        className="absolute top-[150px] left-1/2 size-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,196,110,.55)_0%,rgba(255,170,70,.18)_35%,transparent_68%)] blur-md"
        animate={reducir ? undefined : { opacity: [0.85, 1, 0.85], scale: [1, 1.04, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.svg
        viewBox="0 0 240 300"
        className="relative h-auto w-[220px] origin-top"
        animate={reducir ? undefined : { rotate: [-2.5, 2.5] }}
        transition={{ duration: 4.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      >
        <line x1="120" y1="0" x2="120" y2="130" stroke="#2a2a22" strokeWidth="2" />
        <defs>
          <clipPath id="domo-mimbre">
            <path d="M20 230C20 160 65 128 120 128S220 160 220 230C190 214 155 206 120 206S50 214 20 230Z" />
          </clipPath>
          <radialGradient id="luz-mimbre" cx="50%" cy="85%" r="60%">
            <stop offset="0%" stopColor="#FFE3A6" />
            <stop offset="60%" stopColor="#E7A55A" />
            <stop offset="100%" stopColor="#B87333" />
          </radialGradient>
        </defs>
        <g clipPath="url(#domo-mimbre)">
          <rect x="0" y="120" width="240" height="120" fill="url(#luz-mimbre)" />
          {tejido.map((i) => (
            <ellipse key={`a${i}`} cx="120" cy="230" rx={20 + i * 7} ry={96 - i * 2} fill="none" stroke="#8a5a2b" strokeWidth="1.1" opacity=".75" />
          ))}
          {tejido.map((i) => (
            <line key={`b${i}`} x1={20 + i * 15} y1="240" x2={120 + (i - 7) * 4} y2="128" stroke="#8a5a2b" strokeWidth=".9" opacity=".6" />
          ))}
        </g>
        <path d="M20 230C50 214 85 206 120 206S190 214 220 230" fill="none" stroke="#7a4c22" strokeWidth="2.5" />
        <ellipse cx="120" cy="214" rx="14" ry="9" fill="#FFF3C4" />
        <ellipse cx="120" cy="214" rx="26" ry="14" fill="#FFE08A" opacity=".45" />
      </motion.svg>
    </div>
  );
}

/** Letrero en mayúsculas condensadas que aparece palabra por palabra. */
export function Letrero({ texto, className, retraso = 0 }) {
  const reducir = useReducedMotion();
  const palabras = texto.split(" ");
  return (
    <span className={cn("block", className)}>
      {palabras.map((p, i) => (
        <span key={i} className="inline-block overflow-hidden pr-[0.18em] align-bottom">
          <motion.span
            className="inline-block"
            initial={reducir ? false : { y: "105%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.9, ease: EASE, delay: retraso + i * 0.12 }}
          >
            {p}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Franja con texto que corre de forma continua (se detiene si se pide reducir movimiento). */
export function Franja({ items, className, separador = "✶", duracion = 28 }) {
  const reducir = useReducedMotion();
  const fila = (clave) => (
    <div key={clave} className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={clave === "b" ? true : undefined}>
      {items.map((t, i) => (
        <span key={`${clave}${i}`} className="flex items-center gap-8 whitespace-nowrap">
          {t}
          <span className="text-[0.6em] opacity-80">{separador}</span>
        </span>
      ))}
    </div>
  );
  // El contenedor externo recorta en X: si la franja se rota (p. ej. -rotate-1),
  // sus esquinas sobresalen del viewport y generarían scroll horizontal.
  // -mx-4 la ensancha para que no se vean huecos en los bordes al rotarla.
  return (
    <div className="overflow-x-clip">
      <div className={cn("-mx-4 overflow-hidden", className)}>
        <motion.div
          className="flex w-max"
          animate={reducir ? undefined : { x: ["0%", "-50%"] }}
          transition={{ duration: duracion, repeat: Infinity, ease: "linear" }}
        >
          {fila("a")}
          {fila("b")}
        </motion.div>
      </div>
    </div>
  );
}
