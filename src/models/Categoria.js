import mongoose from "mongoose";

const CategoriaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    imagen: { type: String, required: true },
    publicId: { type: String, required: true },
    position: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Categoria || mongoose.model("Categoria", CategoriaSchema);
