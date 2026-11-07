import mongoose from "mongoose";

// Solo se guarda el jti (identificador aleatorio del token), nunca el token en claro.
const RefreshTokenSchema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true },
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", index: true },
    expiraEn: { type: Date, required: true, index: { expires: 0 } },
    revocado: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.RefreshToken || mongoose.model("RefreshToken", RefreshTokenSchema);
