import mongoose from "mongoose";

const IngredienteSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    cantidad: { type: String, default: "" },
    imagen: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Ingrediente || mongoose.model("Ingrediente", IngredienteSchema);
