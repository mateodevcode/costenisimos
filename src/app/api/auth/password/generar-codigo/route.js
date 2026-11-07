import { randomInt } from "node:crypto";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { ipDe, leerJson, ok, withErrors } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/auth/hash";
import { enviarCodigoRecuperacion } from "@/lib/mailer";
import Usuario from "@/models/Usuario";
import Otp from "@/models/Otp";

const VALIDEZ_MS = 10 * 60 * 1000;
const COOLDOWN_MS = 2 * 60 * 1000;
const MENSAJE =
  "Si el correo está registrado, recibirás un código de 6 dígitos en unos minutos. Puedes pedir uno nuevo cada 2 minutos.";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Correo inválido.").max(200),
});

export const POST = withErrors(async (req) => {
  const { email } = await leerJson(req, schema);
  await rateLimit(`otp:${ipDe(req)}`, 5, 600, "Demasiadas solicitudes de código. Intenta de nuevo en 10 minutos.");

  await connectDB();
  const usuario = await Usuario.findOne({ email }).lean();
  // Respuesta siempre genérica para no revelar qué correos existen.
  if (!usuario) return ok(null, MENSAJE);

  const reciente = await Otp.findOne({ usuarioId: usuario._id }).sort({ createdAt: -1 }).lean();
  if (reciente && Date.now() - new Date(reciente.createdAt).getTime() < COOLDOWN_MS) {
    return ok(null, MENSAJE);
  }

  const codigo = String(randomInt(100000, 1000000));
  await Otp.deleteMany({ usuarioId: usuario._id });
  await Otp.create({
    usuarioId: usuario._id,
    codigoHash: await hashPassword(codigo),
    expiraEn: new Date(Date.now() + VALIDEZ_MS),
  });

  try {
    await enviarCodigoRecuperacion({ to: usuario.email, nombre: usuario.name, codigo });
  } catch (err) {
    console.error("[otp] No se pudo enviar el correo de recuperación:", err);
  }

  return ok(null, MENSAJE);
});
