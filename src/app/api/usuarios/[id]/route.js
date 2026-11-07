import { z } from "zod";
import { connectDB } from "@/lib/db";
import { HttpError, leerJson, ok, validarId, withErrors } from "@/lib/api";
import { requireSession } from "@/lib/auth/guard";
import { revocarTodos } from "@/lib/auth/session";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { ROLES_ADMIN } from "@/lib/constants";
import { serializarUsuario } from "@/lib/usuarios";
import { capitalizar } from "@/lib/utils";
import Usuario from "@/models/Usuario";

/** Dueño de la cuenta o admin/superadmin. Un admin no puede tocar a un superadmin. */
async function autorizar(req, ctx) {
  const session = await requireSession(req);
  const { id } = await ctx.params;
  validarId(id);
  const esDueno = session.id === id;
  const esAdmin = ROLES_ADMIN.includes(session.role);
  if (!esDueno && !esAdmin) throw new HttpError(403, "No tienes permisos sobre esta cuenta.");

  await connectDB();
  const usuario = await Usuario.findById(id);
  if (!usuario) throw new HttpError(404, "Usuario no encontrado.");
  if (!esDueno && usuario.role === "superadmin" && session.role !== "superadmin") {
    throw new HttpError(403, "No tienes permisos sobre esta cuenta.");
  }
  return { session, usuario, esDueno };
}

export const GET = withErrors(async (req, ctx) => {
  const { usuario } = await autorizar(req, ctx);
  return ok(serializarUsuario(usuario.toObject()));
});

const actualizarSchema = z
  .object({
    name: z.string().trim().min(2, "El nombre es muy corto.").max(80),
    email: z.string().trim().toLowerCase().email("Correo inválido.").max(200),
    telefono: z.string().trim().max(30),
    direccion: z.string().trim().max(200),
    imageUrl: z.union([z.literal(""), z.string().trim().url("URL de imagen inválida.").max(1000)]),
    cargo: z.string().trim().max(80),
  })
  .partial()
  .strict();

export const PUT = withErrors(async (req, ctx) => {
  const { usuario } = await autorizar(req, ctx);
  const datos = await leerJson(req, actualizarSchema);

  if (datos.email && datos.email !== usuario.email) {
    if (await Usuario.exists({ email: datos.email, _id: { $ne: usuario._id } })) {
      throw new HttpError(409, "Ya existe una cuenta con ese correo.");
    }
  }
  if (datos.name) datos.name = capitalizar(datos.name);

  usuario.set(datos);
  await usuario.save();
  return ok(serializarUsuario(usuario.toObject()), "Perfil actualizado.");
});

export const DELETE = withErrors(async (req, ctx) => {
  const { usuario, esDueno } = await autorizar(req, ctx);

  if (usuario.role === "superadmin") {
    const otros = await Usuario.countDocuments({ role: "superadmin", _id: { $ne: usuario._id } });
    if (otros === 0) throw new HttpError(400, "No se puede eliminar el único superadmin.");
  }

  await revocarTodos(usuario._id);
  await Usuario.deleteOne({ _id: usuario._id });

  const res = ok(null, "Cuenta eliminada.");
  return esDueno ? clearAuthCookies(res) : res;
});
