import { connectDB } from "@/lib/db";
import { HttpError, ok, withErrors } from "@/lib/api";
import { requireSession } from "@/lib/auth/guard";
import { serializarUsuario } from "@/lib/usuarios";
import Usuario from "@/models/Usuario";

export const GET = withErrors(async (req) => {
  const session = await requireSession(req);
  await connectDB();
  const usuario = await Usuario.findById(session.id).select("+password").lean();
  if (!usuario) throw new HttpError(401, "La cuenta ya no existe.");
  if (usuario.bloqueado) throw new HttpError(403, "Tu cuenta está bloqueada.");
  return ok({ usuario: serializarUsuario(usuario) });
});
