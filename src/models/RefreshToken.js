import mongoose from "mongoose";

// Solo se guarda el jti (identificador aleatorio del token), nunca el token en claro.
const RefreshTokenSchema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true },
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", index: true },
    expiraEn: { type: Date, required: true, index: { expires: 0 } },
    revocado: { type: Boolean, default: false },
    // Cuándo se usó para renovar (rotación). Distingue una renovación simultánea legítima
    // (dos pestañas a la vez) de la reutilización de un token robado.
    rotadoEn: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.RefreshToken || mongoose.model("RefreshToken", RefreshTokenSchema);
