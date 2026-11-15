import { z } from "zod";
import { connectDB } from "@/lib/db";
import { HttpError, leerJson, ok, validarId, withErrors } from "@/lib/api";
import { rateLimitPanel } from "@/lib/rate-limit";
import { requireRole } from "@/lib/auth/guard";
import { revocarTodos } from "@/lib/auth/session";
import { registrar } from "@/lib/registro";
import { ROLES } from "@/lib/constants";
import { serializarUsuario } from "@/lib/usuarios";
import Usuario from "@/models/Usuario";

const schema = z
  .object({
    bloqueado: z.boolean().optional(),
    role: z.enum(ROLES).optional(),
  })
  .strict()
  .refine((d) => d.bloqueado !== undefined || d.role !== undefined, "No hay cambios para aplicar.");

export const PATCH = withErrors(async (req, ctx) => {
  const session = await requireRole(req, ["superadmin"]);
  await rateLimitPanel(session);
  const { id } = await ctx.params;
  validarId(id);
  const datos = await leerJson(req, schema);

  if (id === session.id) {
    if (datos.bloqueado === true) throw new HttpError(400, "No puedes bloquear tu propia cuenta.");
    if (datos.role && datos.role !== "superadmin") throw new HttpError(400, "No puedes quitarte el rol de superadmin.");
  }

  await connectDB();
  const usuario = await Usuario.findById(id);
  if (!usuario) throw new HttpError(404, "Usuario no encontrado.");

  const antes = serializarUsuario(usuario.toObject());

  if (datos.bloqueado !== undefined && datos.bloqueado !== usuario.bloqueado) {
    usuario.bloqueado = datos.bloqueado;
    if (!datos.bloqueado) usuario.intentosLogin = 0;
    await usuario.save();
    if (datos.bloqueado) await revocarTodos(usuario._id);
    await registrar({
      sesion: session,
      accion: datos.bloqueado ? "bloquear" : "desbloquear",
      entidad: "usuario",
      antes: { _id: antes.id, name: antes.name, email: antes.email, bloqueado: antes.bloqueado },
      despues: { _id: antes.id, name: usuario.name, email: usuario.email, bloqueado: usuario.bloqueado },
    });
  }

  if (datos.role && datos.role !== usuario.role) {
    const rolAnterior = usuario.role;
    usuario.role = datos.role;
    await usuario.save();
    // Fuerza a renovar sesión para que el nuevo rol aplique de inmediato.
    await revocarTodos(usuario._id);
    await registrar({
      sesion: session,
      accion: "cambiar_rol",
      entidad: "usuario",
      antes: { _id: antes.id, name: antes.name, email: antes.email, role: rolAnterior },
      despues: { _id: antes.id, name: usuario.name, email: usuario.email, role: usuario.role },
    });
  }

  return ok(serializarUsuario(usuario.toObject()), "Usuario actualizado.");
});

/** Parte del correo antes de la "@" (lo que se escribe para confirmar el borrado). */
const usuarioDeCorreo = (email = "") => String(email).split("@")[0].trim().toLowerCase();

const borrarSchema = z.object({ confirmacion: z.string().trim().max(200) }).strict();

/** Elimina una cuenta. Solo superadmin y con confirmación escrita (usuario del correo). */
export const DELETE = withErrors(async (req, ctx) => {
  const session = await requireRole(req, ["superadmin"]);
  await rateLimitPanel(session);
  const { id } = await ctx.params;
  validarId(id);
  const { confirmacion } = await leerJson(req, borrarSchema);
  if (id === session.id) throw new HttpError(400, "No puedes eliminar tu propia cuenta desde aquí.");

  await connectDB();
  const usuario = await Usuario.findById(id);
  if (!usuario) throw new HttpError(404, "Usuario no encontrado.");
  if (confirmacion.toLowerCase() !== usuarioDeCorreo(usuario.email)) {
    throw new HttpError(400, "La confirmación no coincide con el usuario del correo.");
  }
  if (usuario.role === "superadmin") {
    const otros = await Usuario.countDocuments({ role: "superadmin", _id: { $ne: usuario._id } });
    if (otros === 0) throw new HttpError(400, "No se puede eliminar el único superadmin.");
  }

  const antes = serializarUsuario(usuario.toObject());
  await revocarTodos(usuario._id);
  await Usuario.deleteOne({ _id: usuario._id });

  await registrar({
    sesion: session,
    accion: "eliminar",
    entidad: "usuario",
    antes: { _id: antes.id, name: antes.name, email: antes.email, role: antes.role },
  });
  return ok(null, `Cuenta de ${antes.email} eliminada.`);
});
