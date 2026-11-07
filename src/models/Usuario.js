import mongoose from "mongoose";

const UsuarioSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, default: "", select: false }, // "" = cuenta solo Google
    telefono: { type: String, default: "" },
    direccion: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    cargo: { type: String, default: "" },
    role: { type: String, enum: ["usuario", "empleado", "admin", "superadmin"], default: "usuario" },
    intentosLogin: { type: Number, default: 0 },
    bloqueado: { type: Boolean, default: false },
    ultimoLogin: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Usuario || mongoose.model("Usuario", UsuarioSchema);
