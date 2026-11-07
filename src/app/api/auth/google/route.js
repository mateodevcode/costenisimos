import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import { connectDB } from "@/lib/db";
import { env } from "@/lib/env";
import { HttpError, ipDe, leerJson, ok, withErrors } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { emitirSesion } from "@/lib/auth/session";
import { setAuthCookies } from "@/lib/auth/cookies";
import { serializarUsuario } from "@/lib/usuarios";
import { capitalizar } from "@/lib/utils";
import Usuario from "@/models/Usuario";

const schema = z.object({ credential: z.string().min(20).max(5000) });

let client;

export const POST = withErrors(async (req) => {
  const { credential } = await leerJson(req, schema);
  await rateLimit(`google:${ipDe(req)}`, 10, 60);

  client ??= new OAuth2Client();
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: env.GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch (err) {
    // Causa típica: GOOGLE_CLIENT_ID distinto del Client ID usado en el navegador.
    console.warn("[auth/google] verifyIdToken falló:", err?.message);
    throw new HttpError(401, "No se pudo verificar la cuenta de Google.");
  }
  if (!payload?.email || !payload.email_verified) {
    throw new HttpError(401, "Tu correo de Google no está verificado.");
  }

  await connectDB();
  const email = payload.email.toLowerCase();
  let usuario = await Usuario.findOne({ email });

  if (usuario?.bloqueado) throw new HttpError(403, "Tu cuenta está bloqueada.");

  if (!usuario) {
    usuario = await Usuario.create({
      name: capitalizar(payload.name || email.split("@")[0]),
      email,
      password: "",
      imageUrl: payload.picture || "",
      role: "usuario",
      ultimoLogin: new Date(),
    });
  } else {
    usuario.ultimoLogin = new Date();
    usuario.intentosLogin = 0;
    if (!usuario.imageUrl && payload.picture) usuario.imageUrl = payload.picture;
    await usuario.save();
  }

  const tokens = await emitirSesion(usuario);
  return setAuthCookies(ok({ usuario: serializarUsuario(usuario) }, "Sesión iniciada con Google."), tokens);
});
