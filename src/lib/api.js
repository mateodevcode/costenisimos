import "server-only";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { env } from "@/lib/env";

/** Error controlado: su mensaje sí se devuelve al cliente. */
export class HttpError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export function ok(data = null, message = "OK", init = {}) {
  return NextResponse.json({ success: true, message, data }, { status: 200, ...init });
}

export function created(data = null, message = "Creado correctamente.") {
  return ok(data, message, { status: 201 });
}

export function fail(status, error = "Ocurrió un error.", data) {
  const body = { success: false, message: error };
  if (data !== undefined) body.data = data;
  return NextResponse.json(body, { status });
}

function mensajeZod(err) {
  const issue = err.issues?.[0];
  if (!issue) return "Datos inválidos.";
  const campo = issue.path?.length ? `${issue.path.join(".")}: ` : "";
  return `${campo}${issue.message}`;
}

const METODOS_MUTACION = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Protección CSRF adicional: el Origin de toda mutación debe coincidir con APP_URL. */
function verificarOrigen(req) {
  if (!METODOS_MUTACION.has(req.method)) return;
  const origin = req.headers.get("origin");
  let esperado;
  try {
    esperado = new URL(env.APP_URL).origin;
  } catch {
    throw new Error("[env] APP_URL no es una URL válida.");
  }
  if (!origin || origin !== esperado) {
    throw new HttpError(403, "Origen de la solicitud no permitido.");
  }
}

/**
 * Envuelve un route handler: verifica Origin en mutaciones, traduce errores conocidos
 * y nunca expone err.message crudo en un 500.
 */
export function withErrors(handler, { csrf = true } = {}) {
  return async (req, ctx) => {
    try {
      if (csrf) verificarOrigen(req);
      return await handler(req, ctx);
    } catch (err) {
      // Señales internas de Next (prerender interrumpido, redirect, notFound) deben propagarse.
      unstable_rethrow(err);
      if (err instanceof HttpError) return fail(err.status, err.message, err.data);
      if (err instanceof z.ZodError) return fail(400, mensajeZod(err));
      if (err?.code === 11000) return fail(409, "Ya existe un registro con esos datos.");
      if (err instanceof mongoose.Error.ValidationError) return fail(400, "Datos inválidos.");
      if (err instanceof mongoose.Error.CastError) return fail(400, "Identificador inválido.");
      console.error(`[api] ${req.method} ${req.nextUrl?.pathname ?? ""}`, err);
      return fail(500, "Error interno del servidor. Intenta de nuevo más tarde.");
    }
  };
}

/** Lee y valida el body JSON con un esquema zod. */
export async function leerJson(req, schema) {
  let body;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "El cuerpo de la solicitud no es JSON válido.");
  }
  return schema.parse(body ?? {});
}

/** Valida los query params con un esquema zod. */
export function leerQuery(req, schema) {
  return schema.parse(Object.fromEntries(req.nextUrl.searchParams.entries()));
}

/** Lee multipart/form-data. */
export async function leerFormData(req) {
  try {
    return await req.formData();
  } catch {
    throw new HttpError(400, "Se esperaba multipart/form-data.");
  }
}

export function validarId(id, nombre = "id") {
  if (!id || !mongoose.isValidObjectId(id)) throw new HttpError(400, `El ${nombre} no es válido.`);
  return String(id);
}

export function ipDe(req) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "local";
}

export const zId = z.string().refine((v) => mongoose.isValidObjectId(v), "Identificador inválido.");
