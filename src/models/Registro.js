import mongoose from "mongoose";

const { Mixed } = mongoose.Schema.Types;

export const ACCIONES = [
  "crear",
  "editar",
  "eliminar",
  "cambiar_disponibilidad",
  "reordenar",
  "cambiar_configuracion",
  "bloquear",
  "desbloquear",
  "cambiar_rol",
];
export const ENTIDADES = ["producto", "categoria", "ingrediente", "configuracion", "usuario"];

const RegistroSchema = new mongoose.Schema(
  {
    usuario: {
      id: String,
      name: String,
      email: String,
      role: String,
    },
    accion: { type: String, enum: ACCIONES, required: true },
    entidad: { type: String, enum: ENTIDADES, required: true },
    entidadId: String,
    entidadNombre: String,
    datosAntes: Mixed,
    datosDespues: Mixed,
    cambios: [{ _id: false, campo: String, antes: Mixed, despues: Mixed }],
    fecha: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.models.Registro || mongoose.model("Registro", RegistroSchema);
