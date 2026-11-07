import { z } from "zod";
import { connectDB } from "@/lib/db";
import { HttpError, ipDe, leerJson, ok, withErrors } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { compararPassword } from "@/lib/auth/hash";
import { signReset } from "@/lib/auth/tokens";
import Usuario from "@/models/Usuario";
import Otp from "@/models/Otp";

const MAX_INTENTOS = 5;

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Correo inválido.").max(200),
  codigo: z.string().trim().regex(/^\d{6}$/, "El código debe tener 6 dígitos."),
});

export const POST = withErrors(async (req) => {
  const { email, codigo } = await leerJson(req, schema);
  await rateLimit(`otp-validar:${ipDe(req)}`, 20, 600);

  await connectDB();
  const invalido = new HttpError(400, "Código inválido o expirado. Solicita uno nuevo.");

  const usuario = await Usuario.findOne({ email }).lean();
  if (!usuario) throw invalido;

  const otp = await Otp.findOne({ usuarioId: usuario._id, expiraEn: { $gt: new Date() } }).sort({ createdAt: -1 });
  if (!otp) throw invalido;

  const valido = await compararPassword(codigo, otp.codigoHash);
  if (!valido) {
    otp.intentos += 1;
    if (otp.intentos >= MAX_INTENTOS) {
      await Otp.deleteOne({ _id: otp._id });
      throw new HttpError(400, "Demasiados intentos. Solicita un nuevo código.");
    }
    await otp.save();
    const quedan = MAX_INTENTOS - otp.intentos;
    throw new HttpError(400, `Código incorrecto. Te quedan ${quedan} ${quedan === 1 ? "intento" : "intentos"}.`);
  }

  otp.verificado = true;
  await otp.save();

  const resetToken = await signReset({ id: usuario._id });
  return ok({ resetToken }, "Código verificado. Ya puedes crear una nueva contraseña.");
});
