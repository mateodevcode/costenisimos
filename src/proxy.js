import { NextResponse } from "next/server";
import { verifyAccess } from "@/lib/auth/tokens";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";

// Solo protege /master. La verificación real de rol y bloqueo se hace en app/master/layout.jsx (con BD).
export async function proxy(request) {
  const session = await verifyAccess(request.cookies.get(ACCESS_COOKIE)?.value);
  if (session) return NextResponse.next();

  const url = request.nextUrl.clone();
  const destino = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.pathname = "/";
  url.search = "";
  url.searchParams.set("login", "1");
  url.searchParams.set("callbackUrl", destino);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/master/:path*"],
};
