import mongoose from "mongoose";

/** Promociones y combos que se muestran en la portada. */
const PromocionSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, default: "" },
    etiqueta: { type: String, default: "" }, // p. ej. "Combo", "Navidad", "2x1"
    precio: { type: Number, min: 0, default: null }, // opcional: hay promos sin precio fijo
    precioAntes: { type: Number, min: 0, default: null }, // precio tachado (opcional)
    imagen: { type: String, required: true },
    publicId: { type: String, required: true },
    activa: { type: Boolean, default: true },
    hasta: { type: Date, default: null }, // se oculta sola pasada esta fecha (opcional)
    position: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Promocion || mongoose.model("Promocion", PromocionSchema);
