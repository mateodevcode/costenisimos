import { connectDB } from "@/lib/db";
import { fail, ok, withErrors } from "@/lib/api";
import { verifyRefresh } from "@/lib/auth/tokens";
import { emitirSesion, revocarTodos } from "@/lib/auth/session";
import { REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { serializarUsuario } from "@/lib/usuarios";
import RefreshToken from "@/models/RefreshToken";
import Usuario from "@/models/Usuario";

/** Responde 401 y deja en el log del servidor el motivo (nunca el token). */
function noAutorizado(motivo, mensaje = "Sesión expirada. Inicia sesión de nuevo.") {
  console.warn(`[auth/refresh] 401: ${motivo}`);
  return clearAuthCookies(fail(401, mensaje));
}

export const POST = withErrors(async (req) => {
  const cookie = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!cookie) return noAutorizado("la petición no trae la cookie refresh_token");
  const datos = await verifyRefresh(cookie);
  if (!datos) return noAutorizado("refresh_token con firma inválida o vencido (¿cambió JWT_REFRESH_SECRET?)");

  await connectDB();

  // Rotación atómica: solo un uso por refresh token.
  const usado = await RefreshToken.findOneAndUpdate(
    { jti: datos.jti, revocado: false, expiraEn: { $gt: new Date() } },
    { $set: { revocado: true } }
  );

  if (!usado) {
    const existente = await RefreshToken.findOne({ jti: datos.jti }).lean();
    if (existente?.revocado) {
      // Reutilización de un refresh ya usado: posible robo. Se revocan todas las sesiones.
      await revocarTodos(existente.usuarioId);
      return noAutorizado(`reutilización de un refresh ya usado; se revocaron las sesiones del usuario ${existente.usuarioId}`);
    }
    return noAutorizado(existente ? "refresh_token vencido en BD" : "refresh_token no existe en BD (¿otra base de datos?)");
  }

  if (String(usado.usuarioId) !== datos.id) return noAutorizado("el token no corresponde al usuario");

  const usuario = await Usuario.findById(datos.id);
  if (!usuario) return noAutorizado("el usuario ya no existe");
  if (usuario.bloqueado) {
    await revocarTodos(usuario._id);
    return clearAuthCookies(fail(403, "Tu cuenta está bloqueada."));
  }

  const tokens = await emitirSesion(usuario);
  return setAuthCookies(ok({ usuario: serializarUsuario(usuario) }, "Sesión renovada."), tokens);
});
