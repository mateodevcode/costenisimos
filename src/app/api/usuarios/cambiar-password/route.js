import { z } from "zod";
import { connectDB } from "@/lib/db";
import { HttpError, leerJson, ok, withErrors } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { requireSession } from "@/lib/auth/guard";
import { compararPassword, hashPassword } from "@/lib/auth/hash";
import { PASSWORD_MENSAJE, PASSWORD_REGEX } from "@/lib/auth/password";
import { emitirSesion, revocarTodos } from "@/lib/auth/session";
import { setAuthCookies } from "@/lib/auth/cookies";
import Usuario from "@/models/Usuario";

const schema = z
  .object({
    passwordActual: z.string().min(1, "Ingresa tu contraseña actual.").max(200),
    passwordNueva: z.string().max(200).regex(PASSWORD_REGEX, PASSWORD_MENSAJE),
  })
  .strict();

export const POST = withErrors(async (req) => {
  const session = await requireSession(req);
  await rateLimit(`cambiar-password:${session.id}`, 5, 600, "Demasiados intentos. Espera unos minutos.");
  const { passwordActual, passwordNueva } = await leerJson(req, schema);

  await connectDB();
  const usuario = await Usuario.findById(session.id).select("+password");
  if (!usuario) throw new HttpError(401, "La cuenta ya no existe.");
  if (!usuario.password) {
    throw new HttpError(400, "Tu cuenta usa Google. Para crear una contraseña usa “¿Olvidaste tu contraseña?”.");
  }
  if (!(await compararPassword(passwordActual, usuario.password))) {
    throw new HttpError(400, "La contraseña actual no es correcta.");
  }
  if (passwordActual === passwordNueva) {
    throw new HttpError(400, "La nueva contraseña debe ser distinta de la actual.");
  }

  usuario.password = await hashPassword(passwordNueva);
  await usuario.save();

  // Cierra las demás sesiones y renueva la actual.
  await revocarTodos(usuario._id);
  const tokens = await emitirSesion(usuario);
  return setAuthCookies(ok(null, "Contraseña actualizada."), tokens);
});
