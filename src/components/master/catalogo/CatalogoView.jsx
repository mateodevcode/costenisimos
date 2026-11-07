"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Encabezado, Miniatura, Vacio, coincide } from "@/components/master/comun";
import { ConfirmarBorrado } from "@/components/master/ConfirmarBorrado";
import { ProductoDialog } from "@/components/master/catalogo/ProductoDialog";
import { CategoriaDialog } from "@/components/master/catalogo/CategoriaDialog";
import { IngredienteDialog } from "@/components/master/catalogo/IngredienteDialog";
import { fetchApi } from "@/lib/fetch-api";
import { MENU_TIPOS } from "@/lib/constants";
import { formatearPrecio } from "@/lib/utils";

const NOMBRE_MENU = Object.fromEntries(MENU_TIPOS.map((m) => [m.id, m.nombre]));
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

function Acciones({ onEditar, onEliminar, nombre }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Acciones para ${nombre}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onEditar}>
          <Pencil /> Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onEliminar}>
          <Trash2 /> Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Buscador({ valor, onChange, placeholder }) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={valor} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="pl-9" />
    </div>
  );
}

export function CatalogoView({ categorias, productos, ingredientes, moneda }) {
  const router = useRouter();
  const refrescar = () => router.refresh();
  const [tab, setTab] = useState("productos");
  const [busqueda, setBusqueda] = useState({ productos: "", categorias: "", ingredientes: "" });
  // dialogo: { tipo: "producto"|"categoria"|"ingrediente", item: objeto|null }
  const [dialogo, setDialogo] = useState(null);
  const [borrar, setBorrar] = useState(null);

  const nombreCategoria = useMemo(() => new Map(categorias.map((c) => [c.id, c.nombre])), [categorias]);
  const usosIngrediente = useMemo(() => {
    const m = new Map();
    for (const p of productos) for (const id of p.ingredientes) m.set(id, (m.get(id) || 0) + 1);
    return m;
  }, [productos]);
  const productosPorCategoria = useMemo(() => {
    const m = new Map();
    for (const p of productos) m.set(p.categoria, (m.get(p.categoria) || 0) + 1);
    return m;
  }, [productos]);

  const prodVisibles = productos.filter((p) =>
    coincide(`${p.nombre} ${nombreCategoria.get(p.categoria) ?? ""} ${p.descripcion}`, busqueda.productos)
  );
  const catVisibles = categorias.filter((c) => coincide(c.nombre, busqueda.categorias));
  const ingVisibles = ingredientes.filter((i) => coincide(i.nombre, busqueda.ingredientes));

  /** Calcula el aviso de cascada que verá el usuario antes de borrar. */
  const pedirBorrado = (tipo, item) => {
    let cascada = [];
    if (tipo === "producto") {
      const exclusivos = item.ingredientes.filter((id) => usosIngrediente.get(id) === 1).length;
      if (exclusivos) cascada = [`También se eliminarán ${plural(exclusivos, "ingrediente que solo usa", "ingredientes que solo usa")} este producto.`];
    }
    if (tipo === "categoria") {
      const propios = productos.filter((p) => p.categoria === item.id);
      const idsIng = new Set(propios.flatMap((p) => p.ingredientes));
      const restantes = new Set(productos.filter((p) => p.categoria !== item.id).flatMap((p) => p.ingredientes));
      const huerfanos = [...idsIng].filter((id) => !restantes.has(id)).length;
      if (propios.length) cascada.push(`Se eliminarán ${plural(propios.length, "producto", "productos")} de esta categoría.`);
      if (huerfanos) cascada.push(`Y ${plural(huerfanos, "ingrediente que queda", "ingredientes que quedan")} sin uso.`);
    }
    if (tipo === "ingrediente") {
      const n = usosIngrediente.get(item.id) || 0;
      if (n) cascada = [`Se quitará de ${plural(n, "producto", "productos")}.`];
    }
    setBorrar({ tipo, item, cascada });
  };

  const confirmarBorrado = async () => {
    const ruta = { producto: "productos", categoria: "categorias", ingrediente: "ingredientes" }[borrar.tipo];
    try {
      await fetchApi(`/api/${ruta}?id=${encodeURIComponent(borrar.item.id)}`, { method: "DELETE" });
      toast.success(`${borrar.item.nombre} eliminado.`);
      refrescar();
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const nuevo = () => setDialogo({ tipo: { productos: "producto", categorias: "categoria", ingredientes: "ingrediente" }[tab], item: null });

  return (
    <div>
      <Encabezado titulo="Catálogo" descripcion="Productos, categorías e ingredientes de la carta.">
        <Button onClick={nuevo}>
          <Plus />
          {tab === "productos" ? "Nuevo producto" : tab === "categorias" ? "Nueva categoría" : "Nuevo ingrediente"}
        </Button>
      </Encabezado>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="productos">Productos ({productos.length})</TabsTrigger>
          <TabsTrigger value="categorias">Categorías ({categorias.length})</TabsTrigger>
          <TabsTrigger value="ingredientes">Ingredientes ({ingredientes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="productos" className="grid gap-4">
          <Buscador valor={busqueda.productos} onChange={(v) => setBusqueda((b) => ({ ...b, productos: v }))} placeholder="Buscar producto" />
          {prodVisibles.length === 0 ? (
            <Vacio titulo="No hay productos" descripcion={productos.length ? "Ningún producto coincide con la búsqueda." : "Crea tu primer producto."} />
          ) : (
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="hidden md:table-cell">Categoría</TableHead>
                    <TableHead className="hidden lg:table-cell">Menús</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="hidden sm:table-cell">Estado</TableHead>
                    <TableHead className="w-10">
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prodVisibles.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Miniatura src={p.image} />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{p.nombre}</p>
                            <p className="truncate text-xs text-muted-foreground md:hidden">{nombreCategoria.get(p.categoria)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{nombreCategoria.get(p.categoria) ?? "—"}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {p.menus.length ? p.menus.map((m) => <Badge key={m} variant="outline">{NOMBRE_MENU[m] ?? m}</Badge>) : <span className="text-xs text-muted-foreground">Todos</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatearPrecio(p.precio, moneda)}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={p.disponibilidad ? "secondary" : "destructive"}>{p.disponibilidad ? "Disponible" : "Agotado"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Acciones nombre={p.nombre} onEditar={() => setDialogo({ tipo: "producto", item: p })} onEliminar={() => pedirBorrado("producto", p)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categorias" className="grid gap-4">
          <Buscador valor={busqueda.categorias} onChange={(v) => setBusqueda((b) => ({ ...b, categorias: v }))} placeholder="Buscar categoría" />
          {catVisibles.length === 0 ? (
            <Vacio titulo="No hay categorías" descripcion={categorias.length ? "Ninguna categoría coincide." : "Crea tu primera categoría."} />
          ) : (
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="hidden sm:table-cell">Slug</TableHead>
                    <TableHead className="text-right">Productos</TableHead>
                    <TableHead className="w-10">
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {catVisibles.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Miniatura src={c.imagen} className="w-16" />
                          <span className="font-medium">{c.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">{c.slug}</TableCell>
                      <TableCell className="text-right tabular-nums">{productosPorCategoria.get(c.id) || 0}</TableCell>
                      <TableCell>
                        <Acciones nombre={c.nombre} onEditar={() => setDialogo({ tipo: "categoria", item: c })} onEliminar={() => pedirBorrado("categoria", c)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ingredientes" className="grid gap-4">
          <Buscador valor={busqueda.ingredientes} onChange={(v) => setBusqueda((b) => ({ ...b, ingredientes: v }))} placeholder="Buscar ingrediente" />
          {ingVisibles.length === 0 ? (
            <Vacio titulo="No hay ingredientes" descripcion={ingredientes.length ? "Ningún ingrediente coincide." : "Crea tu primer ingrediente."} />
          ) : (
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingrediente</TableHead>
                    <TableHead className="hidden sm:table-cell">Cantidad</TableHead>
                    <TableHead className="text-right">Usado en</TableHead>
                    <TableHead className="w-10">
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingVisibles.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Miniatura src={i.imagen} redonda />
                          <span className="font-medium">{i.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">{i.cantidad || "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">{plural(usosIngrediente.get(i.id) || 0, "producto", "productos")}</TableCell>
                      <TableCell>
                        <Acciones nombre={i.nombre} onEditar={() => setDialogo({ tipo: "ingrediente", item: i })} onEliminar={() => pedirBorrado("ingrediente", i)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ProductoDialog
        abierto={dialogo?.tipo === "producto"}
        producto={dialogo?.tipo === "producto" ? dialogo.item : null}
        categorias={categorias}
        ingredientes={ingredientes}
        onCerrar={() => setDialogo(null)}
        onGuardado={refrescar}
      />
      <CategoriaDialog
        abierto={dialogo?.tipo === "categoria"}
        categoria={dialogo?.tipo === "categoria" ? dialogo.item : null}
        onCerrar={() => setDialogo(null)}
        onGuardado={refrescar}
      />
      <IngredienteDialog
        abierto={dialogo?.tipo === "ingrediente"}
        ingrediente={dialogo?.tipo === "ingrediente" ? dialogo.item : null}
        productos={productos}
        onCerrar={() => setDialogo(null)}
        onGuardado={refrescar}
      />
      <ConfirmarBorrado
        abierto={Boolean(borrar)}
        onCerrar={() => setBorrar(null)}
        titulo={borrar ? `¿Eliminar “${borrar.item.nombre}”?` : ""}
        descripcion="Esta acción no se puede deshacer. Las imágenes asociadas también se borrarán."
        cascada={borrar?.cascada}
        onConfirmar={confirmarBorrado}
      />
    </div>
  );
}
