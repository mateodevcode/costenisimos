// JWT con jose (HS256). Compatible con Proxy (no importa módulos de Node).
import { SignJWT, jwtVerify } from "jose";

export const ACCESS_TTL = "15m";
export const REFRESH_TTL_DAYS = 7;
export const RESET_TTL = "10m";

const ALG = "HS256";
const enc = new TextEncoder();

function secreto(nombre) {
  const v = process.env[nombre];
  if (!v) throw new Error(`[env] Falta ${nombre}.`);
  return enc.encode(v);
}

export async function signAccess({ id, role, name, email, image }) {
  return new SignJWT({ role: String(role).toLowerCase(), name, email, image: image || "" })
    .setProtectedHeader({ alg: ALG })
    .setSubject(String(id))
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(secreto("JWT_SECRET"));
}

export async function signRefresh({ id, jti }) {
  return new SignJWT({})
    .setProtectedHeader({ alg: ALG })
    .setSubject(String(id))
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL_DAYS}d`)
    .sign(secreto("JWT_REFRESH_SECRET"));
}

export async function signReset({ id }) {
  return new SignJWT({ purpose: "reset" })
    .setProtectedHeader({ alg: ALG })
    .setSubject(String(id))
    .setIssuedAt()
    .setExpirationTime(RESET_TTL)
    .sign(secreto("JWT_SECRET"));
}

/** Devuelve la sesión { id, role, name, email, image } o null si el token no es válido. */
export async function verifyAccess(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secreto("JWT_SECRET"), { algorithms: [ALG] });
    if (payload.purpose) return null; // un token de reset no sirve como sesión
    return {
      id: payload.sub,
      role: String(payload.role || "").toLowerCase(),
      name: payload.name || "",
      email: payload.email || "",
      image: payload.image || "",
    };
  } catch {
    return null;
  }
}

/** Devuelve { id, jti } o null. */
export async function verifyRefresh(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secreto("JWT_REFRESH_SECRET"), { algorithms: [ALG] });
    if (!payload.sub || !payload.jti) return null;
    return { id: payload.sub, jti: payload.jti };
  } catch {
    return null;
  }
}

/** Devuelve { id } o null. */
export async function verifyReset(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secreto("JWT_SECRET"), { algorithms: [ALG] });
    if (payload.purpose !== "reset" || !payload.sub) return null;
    return { id: payload.sub };
  } catch {
    return null;
  }
}
