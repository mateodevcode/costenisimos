"use client";

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const EVENTO_SESION_EXPIRADA = "sesion-expirada";

let refreshEnCurso = null;

/** Renueva la sesión una sola vez aunque varias peticiones fallen a la vez (promesa compartida). */
export function refrescarSesion() {
  refreshEnCurso ??= fetch("/api/auth/refresh", { method: "POST", credentials: "same-origin" })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      setTimeout(() => {
        refreshEnCurso = null;
      }, 0);
    });
  return refreshEnCurso;
}

const SIN_REINTENTO = ["/api/auth/login", "/api/auth/refresh", "/api/auth/logout", "/api/auth/google"];

/**
 * Cliente HTTP del frontend. Devuelve `data` y lanza ApiError con el mensaje del servidor.
 * Ante un 401 intenta renovar la sesión una vez y reintenta.
 * @param {string} url
 * @param {{ method?: string, body?: any, headers?: object, signal?: AbortSignal }} opts
 */
export async function fetchApi(url, { method = "GET", body, headers = {}, signal } = {}, _reintento = false) {
  const esForm = typeof FormData !== "undefined" && body instanceof FormData;
  const init = {
    method,
    credentials: "same-origin",
    signal,
    headers: { Accept: "application/json", ...(body !== undefined && !esForm ? { "Content-Type": "application/json" } : {}), ...headers },
    body: body === undefined ? undefined : esForm ? body : JSON.stringify(body),
  };

  let res;
  try {
    res = await fetch(url, init);
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new ApiError(0, "No hay conexión con el servidor. Revisa tu internet.");
  }

  if (res.status === 401 && !_reintento && !SIN_REINTENTO.some((p) => url.startsWith(p))) {
    if (await refrescarSesion()) return fetchApi(url, { method, body, headers, signal }, true);
    // Sin sesión renovable durante una acción: se avisa para abrir el login sin perder lo que se estaba editando.
    // (/api/auth/me queda fuera: es la comprobación inicial de visitantes anónimos.)
    if (method !== "GET" && typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENTO_SESION_EXPIRADA));
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok || json?.success === false) {
    const mensaje = json?.message || (res.status === 413 ? "El archivo es demasiado grande." : "Ocurrió un error inesperado.");
    throw new ApiError(res.status, mensaje, json?.data);
  }
  return json?.data ?? null;
}
