import { connectDB } from "@/lib/db";
import { ok, withErrors } from "@/lib/api";
import { verifyRefresh } from "@/lib/auth/tokens";
import { REFRESH_COOKIE, clearAuthCookies } from "@/lib/auth/cookies";
import RefreshToken from "@/models/RefreshToken";

export const POST = withErrors(async (req) => {
  const cookie = req.cookies.get(REFRESH_COOKIE)?.value;
  const datos = await verifyRefresh(cookie);
  if (datos) {
    await connectDB();
    await RefreshToken.updateOne({ jti: datos.jti }, { $set: { revocado: true } });
  } else {
    console.warn(`[auth/logout] no se pudo revocar: ${cookie ? "refresh_token inválido" : "la petición no trae la cookie refresh_token"}`);
  }
  return clearAuthCookies(ok(null, "Sesión cerrada."));
});
