"use client";

// Animaciones comunes de los temas (Motion). Todas respetan "reducir movimiento".

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

export const EASE = [0.16, 1, 0.3, 1];

/** Aparece al entrar en pantalla (sube y se desvanece). */
export function Revelar({ as = "div", children, className, retraso = 0, y = 24, once = true, ...props }) {
  const reducir = useReducedMotion();
  const Comp = motion[as] ?? motion.div;
  return (
    <Comp
      className={className}
      initial={reducir ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay: retraso }}
      {...props}
    >
      {children}
    </Comp>
  );
}

const contenedor = { oculto: {}, visible: { transition: { staggerChildren: 0.09 } } };
const hijo = { oculto: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } };

/** Contenedor que revela a sus hijos `<EscalonadoItem>` en cascada. */
export function Escalonado({ as = "div", children, className, alCargar = false, ...props }) {
  const reducir = useReducedMotion();
  const Comp = motion[as] ?? motion.div;
  const disparo = alCargar ? { animate: "visible" } : { whileInView: "visible", viewport: { once: true, margin: "0px 0px -10% 0px" } };
  return (
    <Comp className={className} variants={contenedor} initial={reducir ? false : "oculto"} {...disparo} {...props}>
      {children}
    </Comp>
  );
}
// Exportado aparte (no como Escalonado.Item) para poder usarlo desde Server Components.
export function EscalonadoItem({ as = "div", children, className, ...props }) {
  const Comp = motion[as] ?? motion.div;
  return (
    <Comp className={className} variants={hijo} {...props}>
      {children}
    </Comp>
  );
}

/** Desplaza su contenido a otra velocidad que el scroll (parallax suave). */
export function Parallax({ children, className, distancia = 60 }) {
  const ref = useRef(null);
  const reducir = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reducir ? [0, 0] : [distancia, -distancia]);
  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

/** Gira levemente con el scroll (para sellos y polaroids). */
export function GiroScroll({ children, className, grados = 12, base = 0 }) {
  const ref = useRef(null);
  const reducir = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], reducir ? [base, base] : [base - grados, base + grados]);
  return (
    <motion.div ref={ref} className={className} style={{ rotate }}>
      {children}
    </motion.div>
  );
}

/** Subraya a mano: dibuja un trazo SVG cuando entra en pantalla. */
export function TrazoDibujado({ d = "M4 14C60 4 140 4 236 12", className, color = "currentColor", ancho = 4, viewBox = "0 0 240 20", retraso = 0.4 }) {
  const reducir = useReducedMotion();
  return (
    <svg viewBox={viewBox} className={className} aria-hidden focusable="false" preserveAspectRatio="none">
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={ancho}
        strokeLinecap="round"
        initial={reducir ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: EASE, delay: retraso }}
      />
    </svg>
  );
}
