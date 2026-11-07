import { requerirRolPagina } from "@/lib/auth/pagina";
import { getCatalogo } from "@/lib/catalogo";
import { getSite } from "@/lib/config";
import { ROLES_PANEL } from "@/lib/constants";
import { Suspense } from "react";
import { InventarioView } from "@/components/master/InventarioView";
import { PanelCargando } from "@/components/master/PanelCargando";

export const metadata = { title: "Inventario" };

export default function BuscarPage() {
  return (
    <Suspense fallback={<PanelCargando />}>
      <Contenido />
    </Suspense>
  );
}

async function Contenido() {
  await requerirRolPagina(ROLES_PANEL);
  const [{ categorias, productos, ingredientes }, site] = await Promise.all([getCatalogo(), getSite()]);
  const nombreCat = new Map(categorias.map((c) => [c.id, c.nombre]));
  const usos = new Map();
  for (const p of productos) for (const id of p.ingredientes) usos.set(id, (usos.get(id) || 0) + 1);
  const porCat = new Map();
  for (const p of productos) porCat.set(p.categoria, (porCat.get(p.categoria) || 0) + 1);

  // Filas homogéneas para la tabla (solo lectura).
  const filas = [
    ...productos.map((p) => ({
      id: `p-${p.id}`,
      tipo: "producto",
      nombre: p.nombre,
      imagen: p.image,
      detalle: nombreCat.get(p.categoria) ?? "",
      precio: p.precio,
      estado: p.disponibilidad ? "Disponible" : "Agotado",
      actualizado: p.updatedAt,
    })),
    ...categorias.map((c) => ({
      id: `c-${c.id}`,
      tipo: "categoria",
      nombre: c.nombre,
      imagen: c.imagen,
      detalle: `${porCat.get(c.id) || 0} productos`,
      precio: null,
      estado: "",
      actualizado: c.updatedAt,
    })),
    ...ingredientes.map((i) => ({
      id: `i-${i.id}`,
      tipo: "ingrediente",
      nombre: i.nombre,
      imagen: i.imagen,
      detalle: `${i.cantidad ? `${i.cantidad} · ` : ""}en ${usos.get(i.id) || 0} productos`,
      precio: null,
      estado: "",
      actualizado: i.updatedAt,
    })),
  ];

  const metricas = {
    productos: productos.length,
    disponibles: productos.filter((p) => p.disponibilidad).length,
    agotados: productos.filter((p) => !p.disponibilidad).length,
    categorias: categorias.length,
    ingredientes: ingredientes.length,
  };

  return <InventarioView filas={filas} metricas={metricas} moneda={site.moneda} />;
}
