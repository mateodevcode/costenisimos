import mongoose from "mongoose";

const ProductoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    precio: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    publicId: { type: String, required: true },
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: "Categoria", required: true, index: true },
    descripcion: { type: String, default: "" },
    ingredientes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ingrediente" }],
    disponibilidad: { type: Boolean, default: true },
    menus: { type: [String], default: [] }, // valores válidos: MENU_IDS en src/lib/constants.js
  },
  { timestamps: true }
);

export default mongoose.models.Producto || mongoose.model("Producto", ProductoSchema);
