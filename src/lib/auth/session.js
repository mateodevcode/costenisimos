import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import RefreshToken from "@/models/RefreshToken";
import Usuario from "@/models/Usuario";
import { REFRESH_TTL_DAYS, signAccess, signRefresh, verifyAccess } from "@/lib/auth/tokens";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";

/** Crea un refresh registrado (jti) y un access para el usuario. */
export async function emitirSesion(usuario) {
  await connectDB();
  const jti = randomUUID();
  await RefreshToken.create({
    jti,
    usuarioId: usuario._id,
    expiraEn: new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 3600 * 1000),
  });
  const [access, refresh] = await Promise.all([
    signAccess({
      id: usuario._id,
      role: usuario.role,
      name: usuario.name,
      email: usuario.email,
      image: usuario.imageUrl,
    }),
    signRefresh({ id: usuario._id, jti }),
  ]);
  return { access, refresh };
}

export async function revocarTodos(usuarioId) {
  await connectDB();
  await RefreshToken.updateMany({ usuarioId, revocado: false }, { $set: { revocado: true } });
}

/** Sesión desde el access token (sin BD). Para Server Components. */
export async function getSession() {
  const store = await cookies();
  return verifyAccess(store.get(ACCESS_COOKIE)?.value);
}

/** Usuario fresco desde BD para la sesión actual, o null. Para Server Components. */
export async function getUsuarioActual() {
  const session = await getSession();
  if (!session) return null;
  await connectDB();
  const u = await Usuario.findById(session.id).lean();
  return u || null;
}
