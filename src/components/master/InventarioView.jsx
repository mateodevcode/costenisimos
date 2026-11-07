"use client";

import { useMemo, useState } from "react";
import {
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equalsString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Encabezado, Miniatura } from "@/components/master/comun";
import { cn, formatearPrecio } from "@/lib/utils";

const TIPOS = { producto: "Producto", categoria: "Categoría", ingrediente: "Ingrediente" };

const normalizar = (s = "") =>
  String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Búsqueda global sobre nombre + detalle + tipo, sin acentos. */
function filtroGlobal(row, _columnId, valor) {
  const q = normalizar(String(valor ?? "").trim());
  if (!q) return true;
  const o = row.original;
  return normalizar(`${o.nombre} ${o.detalle} ${TIPOS[o.tipo]} ${o.estado}`).includes(q);
}

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { equalsString: filterFn_equalsString, global: filtroGlobal },
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
});

function Metrica({ titulo, valor, tono }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{titulo}</p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", tono)}>{valor}</p>
    </div>
  );
}

function Ordenable({ column, children, className }) {
  const dir = column.getIsSorted();
  const Icono = dir === "asc" ? ArrowUp : dir === "desc" ? ArrowDown : ArrowUpDown;
  return (
    <button type="button" onClick={column.getToggleSortingHandler()} className={cn("inline-flex items-center gap-1 hover:text-foreground", className)}>
      {children}
      <Icono className="size-3.5" />
    </button>
  );
}

export function InventarioView({ filas, metricas, moneda }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([{ id: "nombre", desc: false }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });

  const columns = useMemo(
    () => [
      {
        accessorKey: "nombre",
        sortFn: "alphanumeric",
        header: ({ column }) => <Ordenable column={column}>Nombre</Ordenable>,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Miniatura src={row.original.imagen} redonda={row.original.tipo === "ingrediente"} className="size-9" />
            <span className="font-medium">{row.original.nombre}</span>
          </div>
        ),
      },
      {
        accessorKey: "tipo",
        filterFn: "equalsString",
        sortFn: "alphanumeric",
        header: ({ column }) => <Ordenable column={column}>Tipo</Ordenable>,
        cell: ({ getValue }) => <Badge variant="outline">{TIPOS[getValue()]}</Badge>,
      },
      {
        accessorKey: "detalle",
        enableSorting: false,
        header: () => "Detalle",
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() || "—"}</span>,
      },
      {
        accessorKey: "precio",
        sortFn: "basic",
        sortUndefined: "last",
        header: ({ column }) => (
          <Ordenable column={column} className="ml-auto">
            Precio
          </Ordenable>
        ),
        cell: ({ getValue }) => <span className="block text-right tabular-nums">{getValue() === null ? "—" : formatearPrecio(getValue(), moneda)}</span>,
      },
      {
        accessorKey: "estado",
        enableSorting: false,
        header: () => "Estado",
        cell: ({ getValue }) =>
          getValue() ? <Badge variant={getValue() === "Agotado" ? "destructive" : "secondary"}>{getValue()}</Badge> : null,
      },
    ],
    [moneda]
  );

  const table = useTable({
    features,
    columns,
    data: filas,
    getRowId: (row) => row.id,
    globalFilterFn: "global",
    state: { globalFilter, columnFilters, sorting, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  const tipo = columnFilters.find((f) => f.id === "tipo")?.value ?? "todos";
  const setTipo = (v) => {
    setColumnFilters(v === "todos" ? [] : [{ id: "tipo", value: v }]);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const filasVisibles = table.getRowModel().rows;
  const totalFiltradas = table.getFilteredRowModel().rows.length;

  return (
    <div>
      <Encabezado titulo="Inventario" descripcion="Búsqueda rápida en todo el catálogo (solo lectura)." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Metrica titulo="Productos" valor={metricas.productos} />
        <Metrica titulo="Disponibles" valor={metricas.disponibles} tono="text-green-700 dark:text-green-500" />
        <Metrica titulo="Agotados" valor={metricas.agotados} tono={metricas.agotados ? "text-destructive" : undefined} />
        <Metrica titulo="Categorías" valor={metricas.categorias} />
        <Metrica titulo="Ingredientes" valor={metricas.ingredientes} />
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            placeholder="Buscar en todo el catálogo"
            aria-label="Buscar en todo el catálogo"
            className="pl-9"
          />
        </div>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-full sm:w-48" aria-label="Filtrar por tipo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            <SelectItem value="producto">Productos</SelectItem>
            <SelectItem value="categoria">Categorías</SelectItem>
            <SelectItem value="ingrediente">Ingredientes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((grupo) => (
              <TableRow key={grupo.id}>
                {grupo.headers.map((h) => (
                  <TableHead key={h.id} className={cn(h.column.id === "detalle" && "hidden md:table-cell", h.column.id === "precio" && "text-right")}>
                    {h.isPlaceholder ? null : <table.FlexRender header={h} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {filasVisibles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Sin resultados.
                </TableCell>
              </TableRow>
            ) : (
              filasVisibles.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className={cn(cell.column.id === "detalle" && "hidden md:table-cell")}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          {totalFiltradas} {totalFiltradas === 1 ? "resultado" : "resultados"}
        </span>
        <div className="flex items-center gap-2">
          <span>
            Página {pagination.pageIndex + 1} de {Math.max(1, table.getPageCount())}
          </span>
          <Button variant="outline" size="icon-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Página anterior">
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Página siguiente">
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
