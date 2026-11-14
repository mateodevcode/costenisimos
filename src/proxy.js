import { NextResponse } from "next/server";
import { verifyAccess } from "@/lib/auth/tokens";
import { ACCESS_COOKIE, RENOVANDO_COOKIE } from "@/lib/auth/cookies";

// Solo protege /master. La verificación real de rol y bloqueo se hace en app/master/layout.jsx (con BD).
export async function proxy(request) {
  const session = await verifyAccess(request.cookies.get(ACCESS_COOKIE)?.value);
  if (session) return NextResponse.next();

  const destino = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const url = request.nextUrl.clone();
  url.search = "";

  // El access token (15 min) venció pero puede haber un refresh válido (7 días). La cookie
  // refresh solo viaja a /api/auth, así que se pasa por allí para renovar y volver.
  // Si ya se intentó hace un momento, se va directo al login para no entrar en bucle.
  if (!request.cookies.has(RENOVANDO_COOKIE)) {
    url.pathname = "/api/auth/refresh";
    url.searchParams.set("destino", destino);
    return NextResponse.redirect(url);
  }

  url.pathname = "/";
  url.searchParams.set("login", "1");
  url.searchParams.set("callbackUrl", destino);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/master/:path*"],
};
