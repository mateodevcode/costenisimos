"use client";

import { useEffect, useRef } from "react";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SRC = "https://accounts.google.com/gsi/client";

let cargaGsi = null;

function cargarGsi() {
  if (typeof window === "undefined") return Promise.reject(new Error("sin window"));
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  cargaGsi ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => {
      cargaGsi = null;
      reject(new Error("No se pudo cargar Google Identity Services."));
    };
    document.head.appendChild(script);
  });
  return cargaGsi;
}

/**
 * Botón "Continuar con Google" (Google Identity Services, renderButton) + One Tap opcional.
 * @param {{ onCredential: (credential: string) => void, oneTap?: boolean, texto?: string }} props
 */
export function GoogleButton({ onCredential, oneTap = false, texto = "continue_with" }) {
  const ref = useRef(null);
  const callbackRef = useRef(onCredential);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelado = false;
    let promptAbierto = false;
    cargarGsi()
      .then((google) => {
        if (cancelado || !ref.current) return;
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (resp) => resp?.credential && callbackRef.current?.(resp.credential),
          ux_mode: "popup",
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
        });
        const ancho = Math.min(400, Math.max(200, Math.floor(ref.current.offsetWidth || 320)));
        google.accounts.id.renderButton(ref.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: texto,
          shape: "pill",
          locale: "es",
          width: ancho,
        });
        if (oneTap) {
          google.accounts.id.prompt();
          promptAbierto = true;
        }
      })
      .catch((err) => console.warn(err.message));
    return () => {
      cancelado = true;
      // Solo se cancela One Tap si se abrió; cancelar sin prompt genera un AbortError ruidoso en consola.
      if (promptAbierto) window.google?.accounts?.id?.cancel?.();
    };
  }, [oneTap, texto]);

  if (!CLIENT_ID) return null;
  return <div ref={ref} className="flex min-h-10 w-full justify-center" />;
}

export const googleHabilitado = Boolean(CLIENT_ID);
