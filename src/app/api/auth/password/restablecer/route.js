import { z } from "zod";
import { connectDB } from "@/lib/db";
import { HttpError, ipDe, leerJson, ok, withErrors } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/auth/hash";
import { PASSWORD_MENSAJE, PASSWORD_REGEX } from "@/lib/auth/password";
import { verifyReset } from "@/lib/auth/tokens";
import { revocarTodos } from "@/lib/auth/session";
import Usuario from "@/models/Usuario";
import Otp from "@/models/Otp";

const schema = z.object({
  resetToken: z.string().min(20).max(2000),
  password: z.string().max(200).regex(PASSWORD_REGEX, PASSWORD_MENSAJE),
});

export const POST = withErrors(async (req) => {
  const { resetToken, password } = await leerJson(req, schema);
  await rateLimit(`otp-restablecer:${ipDe(req)}`, 10, 600);

  const datos = await verifyReset(resetToken);
  const expirado = new HttpError(400, "La solicitud expiró. Vuelve a pedir un código.");
  if (!datos) throw expirado;

  await connectDB();
  // El Otp verificado garantiza que el resetToken se use una sola vez.
  const otp = await Otp.findOne({ usuarioId: datos.id, verificado: true, expiraEn: { $gt: new Date() } });
  if (!otp) throw expirado;

  const usuario = await Usuario.findById(datos.id);
  if (!usuario) throw expirado;

  usuario.password = await hashPassword(password);
  usuario.bloqueado = false;
  usuario.intentosLogin = 0;
  await usuario.save();

  await revocarTodos(usuario._id);
  await Otp.deleteMany({ usuarioId: usuario._id });

  return ok(null, "Contraseña actualizada. Ya puedes iniciar sesión.");
});
