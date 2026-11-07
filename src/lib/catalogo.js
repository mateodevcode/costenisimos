import "server-only";
import { cacheLife, cacheTag, revalidatePath, revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import Categoria from "@/models/Categoria";
import Producto from "@/models/Producto";
import Ingrediente from "@/models/Ingrediente";
import { TAG_CONFIG } from "@/lib/config";

export const TAG_CATALOGO = "catalogo";

const fecha = (d) => (d ? new Date(d).toISOString() : null);

export function serializarCategoria(c) {
  return {
    id: String(c._id),
    nombre: c.nombre,
    slug: c.slug,
    imagen: c.imagen,
    position: c.position ?? 0,
    updatedAt: fecha(c.updatedAt),
  };
}

export function serializarIngrediente(i) {
  return {
    id: String(i._id),
    nombre: i.nombre,
    cantidad: i.cantidad || "",
    imagen: i.imagen,
    updatedAt: fecha(i.updatedAt),
  };
}

export function serializarProducto(p) {
  return {
    id: String(p._id),
    nombre: p.nombre,
    precio: p.precio,
    image: p.image,
    categoria: p.categoria ? String(p.categoria._id ?? p.categoria) : null,
    descripcion: p.descripcion || "",
    ingredientes: (p.ingredientes || []).map((i) => String(i._id ?? i)),
    disponibilidad: p.disponibilidad !== false,
    menus: Array.isArray(p.menus) ? p.menus : [],
    updatedAt: fecha(p.updatedAt),
  };
}

/** Catálogo completo como JSON plano (ids string), cacheado con tag "catalogo". */
export async function getCatalogo() {
  "use cache";
  cacheLife("max");
  cacheTag(TAG_CATALOGO);

  await connectDB();
  const [categorias, productos, ingredientes] = await Promise.all([
    Categoria.find({}).sort({ position: 1, nombre: 1 }).lean(),
    Producto.find({}).sort({ nombre: 1 }).lean(),
    Ingrediente.find({}).sort({ nombre: 1 }).lean(),
  ]);
  return {
    categorias: categorias.map(serializarCategoria),
    productos: productos.map(serializarProducto),
    ingredientes: ingredientes.map(serializarIngrediente),
  };
}

/** [{ categoria, productos: [...] }] en el orden de las categorías; omite categorías vacías si se pide. */
export function agruparPorCategoria(categorias, productos, { omitirVacias = true } = {}) {
  const porCategoria = new Map(categorias.map((c) => [c.id, []]));
  for (const p of productos) porCategoria.get(p.categoria)?.push(p);
  return categorias
    .map((c) => ({ categoria: c, productos: porCategoria.get(c.id) || [] }))
    .filter((g) => !omitirVacias || g.productos.length > 0);
}

/** Invalida el catálogo de inmediato (la carta pública se actualiza sin recargar). */
export function revalidarCatalogo() {
  revalidateTag(TAG_CATALOGO, { expire: 0 });
  revalidatePath("/", "layout");
}

export function revalidarConfig() {
  revalidateTag(TAG_CONFIG, { expire: 0 });
  revalidatePath("/", "layout");
}
