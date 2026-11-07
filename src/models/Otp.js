import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema(
  {
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
    codigoHash: { type: String, required: true },
    intentos: { type: Number, default: 0 },
    verificado: { type: Boolean, default: false },
    expiraEn: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

export default mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
