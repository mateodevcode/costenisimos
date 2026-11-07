import "server-only";

/** Usuario plano y seguro para enviar al cliente (nunca incluye password). */
export function serializarUsuario(u) {
  if (!u) return null;
  return {
    id: String(u._id ?? u.id),
    name: u.name,
    email: u.email,
    telefono: u.telefono || "",
    direccion: u.direccion || "",
    imageUrl: u.imageUrl || "",
    cargo: u.cargo || "",
    role: String(u.role || "usuario").toLowerCase(),
    bloqueado: Boolean(u.bloqueado),
    ultimoLogin: u.ultimoLogin ? new Date(u.ultimoLogin).toISOString() : null,
    tienePassword: typeof u.password === "string" ? u.password.length > 0 : undefined,
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : null,
  };
}
