import { z } from "zod";
import { connectDB } from "@/lib/db";
import { HttpError, ipDe, leerJson, ok, withErrors } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { compararPassword, compararPasswordFicticia } from "@/lib/auth/hash";
import { emitirSesion } from "@/lib/auth/session";
import { setAuthCookies } from "@/lib/auth/cookies";
import { serializarUsuario } from "@/lib/usuarios";
import Usuario from "@/models/Usuario";

const MAX_INTENTOS = 5;

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Correo inválido.").max(200),
  password: z.string().min(1, "La contraseña es obligatoria.").max(200),
});

export const POST = withErrors(async (req) => {
  const { email, password } = await leerJson(req, schema);
  await rateLimit(`login:${ipDe(req)}:${email}`, 5, 60, "Demasiados intentos de inicio de sesión. Espera un minuto.");

  await connectDB();
  const usuario = await Usuario.findOne({ email }).select("+password");
  const generico = new HttpError(401, "Credenciales inválidas.");

  if (!usuario) {
    await compararPasswordFicticia(password); // igualar tiempos: no revelar si el correo existe
    throw generico;
  }
  if (usuario.bloqueado) {
    throw new HttpError(403, "Tu cuenta está bloqueada. Restablece tu contraseña o contacta al administrador.");
  }
  if (!usuario.password) {
    throw new HttpError(401, "Esta cuenta se creó con Google. Inicia sesión con el botón de Google.");
  }

  const valido = await compararPassword(password, usuario.password);
  if (!valido) {
    const actualizado = await Usuario.findByIdAndUpdate(
      usuario._id,
      { $inc: { intentosLogin: 1 } },
      { returnDocument: "after" }
    );
    if (actualizado && actualizado.intentosLogin >= MAX_INTENTOS && !actualizado.bloqueado) {
      await Usuario.updateOne({ _id: usuario._id }, { $set: { bloqueado: true } });
      throw new HttpError(403, "Tu cuenta fue bloqueada por demasiados intentos fallidos. Restablece tu contraseña.");
    }
    throw generico;
  }

  usuario.intentosLogin = 0;
  usuario.ultimoLogin = new Date();
  await usuario.save();

  const tokens = await emitirSesion(usuario);
  const res = ok({ usuario: serializarUsuario(usuario) }, "Sesión iniciada.");
  return setAuthCookies(res, tokens);
});
