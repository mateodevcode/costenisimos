// Formas de marca: ola separadora, sello ondulado (portada de la carta) y marco en arco (aviso del local).

import Image from "next/image";
import { cn } from "@/lib/utils";

/** Ola que separa secciones. `color` es el de la sección que sigue. */
export function Ola({ color = "var(--color-paper)", className, invertida = false }) {
  return (
    <svg
      viewBox="0 0 1440 72"
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute inset-x-0 block h-12 w-full sm:h-[72px]", invertida ? "-top-px rotate-180" : "-bottom-px", className)}
      aria-hidden
      focusable="false"
    >
      <path d="M0 40C180 8 360 8 540 34S900 72 1080 46 1320 6 1440 26V72H0Z" fill={color} />
    </svg>
  );
}

/** Puntos de un círculo con bordes ondulados (n ondas). */
function trazoOndulado(n = 18, r = 100, amp = 7) {
  const pasos = n * 8;
  let d = "";
  for (let i = 0; i <= pasos; i++) {
    const a = (i / pasos) * Math.PI * 2;
    const rr = r - amp + amp * Math.cos(a * n);
    const x = 110 + rr * Math.cos(a);
    const y = 110 + rr * Math.sin(a);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${d}Z`;
}
const ONDULADO = trazoOndulado();

/** Sello ondulado (como el de la portada de la carta) con contenido centrado. */
export function SelloOndulado({ className, color = "#F08A24", children, puntos = true }) {
  return (
    <div className={cn("relative grid place-items-center", className)}>
      <svg viewBox="0 0 220 220" className="absolute inset-0 size-full" aria-hidden focusable="false">
        <defs>
          <pattern id="puntos-sello" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="rgba(160,60,0,.28)" />
          </pattern>
        </defs>
        <path d={ONDULADO} fill={color} />
        {puntos && <path d={ONDULADO} fill="url(#puntos-sello)" />}
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}

/** Cabecera con banda ondulada naranja (como los títulos de las cartas impresas: "EMPANADAS"). */
export function BannerOndulado({ children, id, as: Tag = "h2", className, textoClassName }) {
  return (
    <div className={cn("relative mx-auto w-fit px-12 py-7 md:px-16", className)}>
      <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute inset-0 size-full drop-shadow-md" aria-hidden focusable="false">
        <path
          d="M10 30C30 6 52 18 72 8S118 4 140 12 186 2 210 10 256 4 280 12 326 2 350 10 394 14 392 40C402 62 384 78 392 100C372 118 350 106 328 114S282 118 260 110 214 120 190 112 144 118 120 110 74 120 50 112 6 108 8 86C-2 64 16 50 10 30Z"
          fill="#F08A24"
        />
      </svg>
      <Tag
        id={id}
        className={cn("relative font-anton text-[clamp(36px,5vw,64px)] leading-[0.95] tracking-wide text-white uppercase [text-shadow:3px_3px_0_#1B2A5C]", textoClassName)}
      >
        {children}
      </Tag>
    </div>
  );
}

/** Foto enmarcada en arco (bordes superiores redondeados como el aviso del local). */
export function Arco({ src, alt, className, borde = "border-sun", sizes = "(max-width: 900px) 80vw, 460px", prioridad = false, children }) {
  return (
    <div className={cn("relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[32px] bg-kraft", borde && `border-8 ${borde}`, className)}>
      {src && <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" priority={prioridad} />}
      {children}
    </div>
  );
}
