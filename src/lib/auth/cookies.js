import { REFRESH_TTL_DAYS } from "@/lib/auth/tokens";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

const prod = process.env.NODE_ENV === "production";
const base = { httpOnly: true, secure: prod, sameSite: "lax", path: "/" };

export const accessCookieOptions = { ...base, maxAge: 15 * 60 };
// El refresh solo viaja a /api/auth/*
export const refreshCookieOptions = { ...base, path: "/api/auth", maxAge: REFRESH_TTL_DAYS * 24 * 3600 };

/** Escribe ambas cookies en una NextResponse. */
export function setAuthCookies(res, { access, refresh }) {
  res.cookies.set(ACCESS_COOKIE, access, accessCookieOptions);
  if (refresh) res.cookies.set(REFRESH_COOKIE, refresh, refreshCookieOptions);
  return res;
}

/** Borra ambas cookies (mismas rutas con las que se crearon). */
export function clearAuthCookies(res) {
  res.cookies.set(ACCESS_COOKIE, "", { ...accessCookieOptions, maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", { ...refreshCookieOptions, maxAge: 0 });
  return res;
}
