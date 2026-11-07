"use client";

// Follaje tropical de la caja de domicilios (hojas, palmas, flores y sandía), con un vaivén suave.

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const TALLO = "#121D45";

export function Hoja({ color }) {
  return (
    <g style={{ color }}>
      <path d="M0 0C50-55 150-55 200 0C150 55 50 55 0 0Z" fill="currentColor" />
      <path
        d="M8 0H194M45 0l18-22M85 0l18-27M125 0l18-25M162 0l14-14M45 0l18 22M85 0l18 27M125 0l18 25M162 0l14 14"
        stroke={TALLO}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

export function Palma({ color }) {
  return (
    <g style={{ color }}>
      <path d="M0 0C30-10 70-60 140-70C110-40 90-10 0 0Z" fill="currentColor" />
      <path
        d="M0 0C40-20 90-55 140-70M30-12l-6-22M55-24l-4-26M80-38l-1-26M105-52l2-20M30-12l20 10M55-24l24 6M80-38l24 2M105-52l22-4"
        stroke={TALLO}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

export function Flor() {
  return (
    <g>
      <g fill="#FFF8EE">
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cy="-20" rx="11" ry="20" transform={`rotate(${r})`} />
        ))}
      </g>
      <circle r="6" fill="#F2C230" />
    </g>
  );
}

export function Sandia() {
  return (
    <g>
      <path d="M-60 0A60 60 0 0 0 60 0Z" fill="#3E8E5A" />
      <path d="M-52 0A52 52 0 0 0 52 0Z" fill="#E8457A" />
      {[-30, -12, 8, 26].map((x, i) => (
        <ellipse key={x} cx={x} cy={14 + (i % 2) * 10} rx="3" ry="5" fill="#1B2A5C" />
      ))}
    </g>
  );
}

/** Follaje dibujado a línea (tinta azul de la bolsa kraft). Se dibuja solo al entrar en pantalla. */
export function RamoTinta({ className, espejo = false, size = 300, color = "#1F2E63" }) {
  const reducir = useReducedMotion();
  const trazo = (d, i) =>
    reducir ? (
      <path key={i} d={d} />
    ) : (
      <motion.path
        key={i}
        d={d}
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, delay: 0.15 * i, ease: "easeInOut" }}
      />
    );
  const caminos = [
    // hoja grande
    "M20 220C70 160 170 150 230 190C170 230 70 250 20 220Z",
    "M30 218L222 192M70 210l20-26M110 205l22-30M150 200l20-26M70 210l22 18M110 205l24 22M150 200l20 18",
    // palma
    "M30 290C70 270 120 200 200 180C170 220 140 260 30 290Z",
    "M30 290C80 260 140 210 200 180M60 280l-4-24M90 265l-2-28M120 245l2-26M150 222l4-22",
    // flor
    "M150 120m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0",
    "M150 114C142 96 158 96 150 114M156 118C174 112 172 128 156 122M150 126C158 144 142 144 150 126M144 122C126 128 128 112 144 118",
  ];
  return (
    <svg
      viewBox="0 0 300 300"
      width={size}
      height={size}
      className={cn("pointer-events-none absolute select-none", className)}
      style={{ transform: espejo ? "scaleX(-1)" : undefined }}
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      {caminos.map(trazo)}
    </svg>
  );
}

const PALETAS = {
  tropical: ["#3E8E5A", "#F08A24", "#D6336C", "#F2C230"],
  calida: ["#F2C230", "#D6336C", "#3E8E5A", "#F08A24"],
  rosa: ["#D6336C", "#3E8E5A", "#F2C230", "#F08A24"],
};

/**
 * Ramo decorativo posicionado en una esquina. `paleta` elige el orden de colores.
 * Decorativo: aria-hidden y sin eventos.
 */
export function Ramo({ className, paleta = "tropical", girar = 0, size = 460, sandia = false, animar = true }) {
  const reducir = useReducedMotion();
  const [c1, c2, c3, c4] = PALETAS[paleta] ?? PALETAS.tropical;
  const vaiven = animar && !reducir;
  const G = vaiven ? motion.g : "g";
  const mov = (d, a) =>
    vaiven
      ? { animate: { rotate: [-a, a] }, transition: { duration: d, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" } }
      : {};

  return (
    <svg
      viewBox="0 0 420 420"
      width={size}
      height={size}
      className={cn("pointer-events-none absolute select-none", className)}
      style={{ transform: girar ? `rotate(${girar}deg)` : undefined }}
      aria-hidden
      focusable="false"
    >
      <G style={{ transformOrigin: "0px 420px" }} {...mov(7, 2.5)}>
        <g transform="translate(-10 300) rotate(-40)">
          <Hoja color={c1} />
        </g>
      </G>
      <G style={{ transformOrigin: "40px 410px" }} {...mov(9, 3)}>
        <g transform="translate(40 410) rotate(-10) scale(1.3)">
          <Palma color={c2} />
        </g>
      </G>
      <G style={{ transformOrigin: "10px 400px" }} {...mov(8, 2)}>
        <g transform="translate(10 400) rotate(-75) scale(.9)">
          <Hoja color={c3} />
        </g>
      </G>
      <g transform="translate(-30 210) rotate(-8) scale(.85)">
        <Hoja color={c4} />
      </g>
      {sandia && (
        <g transform="translate(250 380) rotate(-25) scale(.9)">
          <Sandia />
        </g>
      )}
      <g transform="translate(175 250)">
        <Flor />
      </g>
      <g transform="translate(115 160) scale(.8)">
        <Flor />
      </g>
      <g transform="translate(240 340) scale(.7)">
        <Flor />
      </g>
    </svg>
  );
}
