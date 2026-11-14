"use client";

import { useEffect } from "react";
import { refrescarSesion } from "@/lib/fetch-api";

// El access token dura 15 min: se renueva antes de que venza mientras el panel está abierto.
const CADA_MS = 12 * 60 * 1000;

/** Mantiene viva la sesión del panel (renovación periódica y al volver a la pestaña). */
export function useMantenerSesion() {
  useEffect(() => {
    let ultima = Date.now();
    const renovar = () => {
      ultima = Date.now();
      refrescarSesion();
    };
    const id = setInterval(() => {
      if (document.visibilityState === "visible") renovar();
    }, CADA_MS);
    // Las pestañas en segundo plano pueden congelar los timers: al volver, se renueva si toca.
    const alVolver = () => {
      if (document.visibilityState === "visible" && Date.now() - ultima >= CADA_MS) renovar();
    };
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, []);
}
