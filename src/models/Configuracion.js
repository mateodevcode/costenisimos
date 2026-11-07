import mongoose from "mongoose";

const ConfiguracionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.models.Configuracion || mongoose.model("Configuracion", ConfiguracionSchema);
