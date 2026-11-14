import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { fail, ok, withErrors } from "@/lib/api";
import { verifyRefresh } from "@/lib/auth/tokens";
import { emitirSesion, revocarTodos } from "@/lib/auth/session";
import { REFRESH_COOKIE, RENOVANDO_COOKIE, clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { serializarUsuario } from "@/lib/usuarios";
import RefreshToken from "@/models/RefreshToken";
import Usuario from "@/models/Usuario";

/**
 * Ventana en la que un refresh recién rotado puede volver a presentarse sin tratarlo como robo:
 * pasa cuando dos pestañas (o el proxy y una pestaña) renuevan a la vez con la misma cookie.
 */
const GRACIA_MS = 30_000;

/**
 * Renueva la sesión a partir de la cookie refresh_token.
 * @returns {Promise<{ usuario, tokens } | { error: string, status: number, mensaje: string }>}
 */
async function renovar(req) {
  const sinSesion = (motivo, status = 401, mensaje = "Sesión expirada. Inicia sesión de nuevo.") => {
    console.warn(`[auth/refresh] ${status}: ${motivo}`);
    return { error: motivo, status, mensaje };
  };

  const cookie = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!cookie) return sinSesion("la petición no trae la cookie refresh_token");
  const datos = await verifyRefresh(cookie);
  if (!datos) return sinSesion("refresh_token con firma inválida o vencido (¿cambió JWT_REFRESH_SECRET?)");

  await connectDB();

  // Rotación atómica: solo un uso por refresh token.
  const usado = await RefreshToken.findOneAndUpdate(
    { jti: datos.jti, revocado: false, expiraEn: { $gt: new Date() } },
    { $set: { revocado: true, rotadoEn: new Date() } }
  );

  if (!usado) {
    const existente = await RefreshToken.findOne({ jti: datos.jti }).lean();
    const recienRotado = existente?.rotadoEn && Date.now() - new Date(existente.rotadoEn).getTime() < GRACIA_MS;
    if (existente?.revocado && !recienRotado) {
      // Reutilización de un refresh ya usado hace rato: posible robo. Se revocan todas las sesiones.
      await revocarTodos(existente.usuarioId);
      return sinSesion(`reutilización de un refresh ya usado; se revocaron las sesiones del usuario ${existente.usuarioId}`);
    }
    if (!recienRotado) {
      return sinSesion(existente ? "refresh_token vencido en BD" : "refresh_token no existe en BD (¿otra base de datos?)");
    }
    // Renovación simultánea legítima: se emite una sesión nueva para esta petición también.
  }

  const usuarioId = String((usado ?? (await RefreshToken.findOne({ jti: datos.jti }).lean())).usuarioId);
  if (usuarioId !== datos.id) return sinSesion("el token no corresponde al usuario");

  const usuario = await Usuario.findById(datos.id);
  if (!usuario) return sinSesion("el usuario ya no existe");
  if (usuario.bloqueado) {
    await revocarTodos(usuario._id);
    return sinSesion("cuenta bloqueada", 403, "Tu cuenta está bloqueada.");
  }

  return { usuario, tokens: await emitirSesion(usuario) };
}

/** Renovación desde el cliente (fetchApi). */
export const POST = withErrors(async (req) => {
  const r = await renovar(req);
  if (r.error) return clearAuthCookies(fail(r.status, r.mensaje));
  return setAuthCookies(ok({ usuario: serializarUsuario(r.usuario) }, "Sesión renovada."), r.tokens);
});

/** Solo rutas internas ("/algo"), nunca "//dominio" ni URLs absolutas. */
function destinoSeguro(valor) {
  return typeof valor === "string" && /^\/(?![/\\])/.test(valor) ? valor : "/master";
}

/**
 * Renovación al navegar: el proxy redirige aquí cuando el access token del panel venció.
 * Si se puede renovar, vuelve a la página pedida; si no, abre el login.
 */
export const GET = withErrors(async (req) => {
  const destino = destinoSeguro(req.nextUrl.searchParams.get("destino"));
  const r = await renovar(req);
  if (r.error) {
    const login = new URL("/", req.nextUrl);
    login.searchParams.set("login", "1");
    login.searchParams.set("callbackUrl", destino);
    return clearAuthCookies(NextResponse.redirect(login));
  }
  const res = setAuthCookies(NextResponse.redirect(new URL(destino, req.nextUrl)), r.tokens);
  // Marca de corta duración: si al volver el proxy aún no ve el access token, no se reintenta en bucle.
  res.cookies.set(RENOVANDO_COOKIE, "1", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 20 });
  return res;
});
