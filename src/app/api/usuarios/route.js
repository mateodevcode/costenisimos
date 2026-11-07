import { z } from "zod";
import { connectDB } from "@/lib/db";
import { HttpError, created, ipDe, leerJson, ok, withErrors } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { requireRole } from "@/lib/auth/guard";
import { hashPassword } from "@/lib/auth/hash";
import { PASSWORD_MENSAJE, PASSWORD_REGEX } from "@/lib/auth/password";
import { ROLES_PANEL } from "@/lib/constants";
import { serializarUsuario } from "@/lib/usuarios";
import { capitalizar } from "@/lib/utils";
import Usuario from "@/models/Usuario";

export const GET = withErrors(async (req) => {
  await requireRole(req, ROLES_PANEL);
  await connectDB();
  const usuarios = await Usuario.find({}).sort({ createdAt: -1 }).lean();
  return ok(usuarios.map(serializarUsuario));
});

// Registro público: whitelist estricta, el rol SIEMPRE es "usuario".
const registroSchema = z
  .object({
    name: z.string().trim().min(2, "El nombre es muy corto.").max(80),
    email: z.string().trim().toLowerCase().email("Correo inválido.").max(200),
    password: z.string().max(200).regex(PASSWORD_REGEX, PASSWORD_MENSAJE),
    telefono: z.string().trim().max(30).optional(),
  })
  .strict();

export const POST = withErrors(async (req) => {
  await rateLimit(`registro:${ipDe(req)}`, 5, 60, "Demasiados registros desde esta conexión. Espera un minuto.");
  const datos = await leerJson(req, registroSchema);

  await connectDB();
  if (await Usuario.exists({ email: datos.email })) {
    throw new HttpError(409, "Ya existe una cuenta con ese correo.");
  }

  const usuario = await Usuario.create({
    name: capitalizar(datos.name),
    email: datos.email,
    password: await hashPassword(datos.password),
    telefono: datos.telefono || "",
    role: "usuario",
  });

  return created(serializarUsuario(usuario.toObject()), "Cuenta creada correctamente.");
});
