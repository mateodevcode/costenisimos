import { requerirRolPagina } from "@/lib/auth/pagina";
import { connectDB } from "@/lib/db";
import { serializarUsuario } from "@/lib/usuarios";
import { ROLES_ADMIN } from "@/lib/constants";
import { UsuariosView } from "@/components/master/UsuariosView";
import Usuario from "@/models/Usuario";
import { Suspense } from "react";
import { PanelCargando } from "@/components/master/PanelCargando";

export const metadata = { title: "Usuarios" };

export default function UsuariosPage() {
  return (
    <Suspense fallback={<PanelCargando />}>
      <Contenido />
    </Suspense>
  );
}

async function Contenido() {
  const actual = await requerirRolPagina(ROLES_ADMIN);
  await connectDB();
  const usuarios = (await Usuario.find({}).sort({ createdAt: -1 }).lean()).map(serializarUsuario);
  return <UsuariosView usuarios={usuarios} miId={String(actual._id)} puedeGestionar={actual.role === "superadmin"} />;
}
