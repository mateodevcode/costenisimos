import "server-only";
import { cacheLife, cacheTag, revalidatePath, revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import Promocion from "@/models/Promocion";

export const TAG_PROMOCIONES = "promociones";

const fecha = (d) => (d ? new Date(d).toISOString() : null);

export function serializarPromocion(p) {
  return {
    id: String(p._id),
    nombre: p.nombre,
    descripcion: p.descripcion || "",
    etiqueta: p.etiqueta || "",
    precio: typeof p.precio === "number" ? p.precio : null,
    precioAntes: typeof p.precioAntes === "number" ? p.precioAntes : null,
    imagen: p.imagen,
    activa: p.activa !== false,
    hasta: fecha(p.hasta),
    position: p.position ?? 0,
    updatedAt: fecha(p.updatedAt),
  };
}

/** Todas las promociones (panel), cacheadas con tag "promociones". */
export async function getPromociones() {
  "use cache";
  cacheLife("max");
  cacheTag(TAG_PROMOCIONES);

  await connectDB();
  const lista = await Promocion.find({}).sort({ position: 1, createdAt: -1 }).lean();
  return lista.map(serializarPromocion);
}

/** Las que se ven en la web: activas y sin vencer. Filtra en cada petición (la fecha cambia). */
export function promocionesVigentes(lista, ahora = new Date()) {
  return lista.filter((p) => p.activa && (!p.hasta || new Date(p.hasta) >= ahora));
}

export function revalidarPromociones() {
  revalidateTag(TAG_PROMOCIONES, { expire: 0 });
  revalidatePath("/", "layout");
}
