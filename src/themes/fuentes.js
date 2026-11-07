// Tipografías de los temas. Solo definen variables CSS: el navegador descarga cada fuente
// únicamente cuando un tema la usa (preload desactivado salvo la de cuerpo general).
import { Anton, Caveat, Figtree, Fraunces, Nunito, Yellowtail, Young_Serif } from "next/font/google";

// Línea tropical (plantilla opción 1)
export const fraunces = Fraunces({
  variable: "--nf-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});
export const nunito = Nunito({ variable: "--nf-nunito", subsets: ["latin"], display: "swap", preload: false });

// Línea kraft (plantilla opción 2)
export const youngSerif = Young_Serif({ variable: "--nf-young", subsets: ["latin"], weight: "400", display: "swap", preload: false });
export const figtree = Figtree({ variable: "--nf-figtree", subsets: ["latin"], display: "swap", preload: false });
export const caveat = Caveat({ variable: "--nf-caveat", subsets: ["latin"], weight: ["600", "700"], display: "swap", preload: false });

// Línea "Lo auténtico" (letrero de la pared y cartas impresas)
export const anton = Anton({ variable: "--nf-anton", subsets: ["latin"], weight: "400", display: "swap", preload: false });
export const yellowtail = Yellowtail({ variable: "--nf-yellowtail", subsets: ["latin"], weight: "400", display: "swap", preload: false });

export const variablesFuentesTemas = [fraunces, nunito, youngSerif, figtree, caveat, anton, yellowtail]
  .map((f) => f.variable)
  .join(" ");
