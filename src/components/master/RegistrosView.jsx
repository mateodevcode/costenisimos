"use client";

import { Fragment, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Encabezado, Vacio } from "@/components/master/comun";
import { fetchApi } from "@/lib/fetch-api";
import { cn } from "@/lib/utils";

const ENTIDADES = { producto: "Producto", categoria: "Categoría", ingrediente: "Ingrediente", configuracion: "Configuración", usuario: "Usuario" };
const ACCIONES = {
  crear: "Crear",
  editar: "Editar",
  eliminar: "Eliminar",
  cambiar_disponibilidad: "Disponibilidad",
  reordenar: "Reordenar",
  cambiar_configuracion: "Configuración",
  bloquear: "Bloquear",
  desbloquear: "Desbloquear",
  cambiar_rol: "Cambiar rol",
};
const TONO = { crear: "secondary", eliminar: "destructive", bloquear: "destructive" };
const fechaHora = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" });
const FILTROS_VACIOS = { entidad: "todas", accion: "todas", desde: "", hasta: "" };

function Valor({ valor }) {
  if (valor === null || valor === undefined || valor === "") return <span className="text-muted-foreground italic">vacío</span>;
  if (typeof valor === "boolean") return <span>{valor ? "Sí" : "No"}</span>;
  if (typeof valor === "object") {
    return <pre className="max-h-40 overflow-auto rounded bg-muted/60 p-2 text-xs whitespace-pre-wrap">{JSON.stringify(valor, null, 2)}</pre>;
  }
  return <span className="break-words">{String(valor)}</span>;
}

export function RegistrosView() {
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [estado, setEstado] = useState({ cargando: true, error: "", registros: [] });
  const [abiertos, setAbiertos] = useState(() => new Set());
  const set = (k, v) => setFiltros((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const ctrl = new AbortController();
    const q = new URLSearchParams({ limite: "300" });
    if (filtros.entidad !== "todas") q.set("entidad", filtros.entidad);
    if (filtros.accion !== "todas") q.set("accion", filtros.accion);
    if (filtros.desde) q.set("desde", filtros.desde);
    if (filtros.hasta) q.set("hasta", filtros.hasta);
    fetchApi(`/api/registros?${q}`, { signal: ctrl.signal })
      .then((registros) => setEstado({ cargando: false, error: "", registros }))
      .catch((err) => {
        if (err.name !== "AbortError") setEstado({ cargando: false, error: err.message, registros: [] });
      });
    return () => ctrl.abort();
  }, [filtros]);

  const cambiarFiltro = (k, v) => {
    setEstado((e) => ({ ...e, cargando: true }));
    set(k, v);
  };

  const alternar = (id) =>
    setAbiertos((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div>
      <Encabezado titulo="Registros" descripcion="Bitácora de cambios: quién hizo qué y cuándo." />

      <div className="mb-4 grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto_auto] lg:items-end">
        <div className="grid gap-1.5">
          <Label>Entidad</Label>
          <Select value={filtros.entidad} onValueChange={(v) => cambiarFiltro("entidad", v)}>
            <SelectTrigger className="w-full" aria-label="Entidad">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {Object.entries(ENTIDADES).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Acción</Label>
          <Select value={filtros.accion} onValueChange={(v) => cambiarFiltro("accion", v)}>
            <SelectTrigger className="w-full" aria-label="Acción">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {Object.entries(ACCIONES).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="r-desde">Desde</Label>
          <Input id="r-desde" type="date" value={filtros.desde} max={filtros.hasta || undefined} onChange={(e) => cambiarFiltro("desde", e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="r-hasta">Hasta</Label>
          <Input id="r-hasta" type="date" value={filtros.hasta} min={filtros.desde || undefined} onChange={(e) => cambiarFiltro("hasta", e.target.value)} />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setEstado((e) => ({ ...e, cargando: true }));
            setFiltros(FILTROS_VACIOS);
          }}
        >
          <RotateCcw /> Limpiar
        </Button>
      </div>

      {estado.error ? (
        <Vacio titulo="No se pudieron cargar los registros" descripcion={estado.error} />
      ) : estado.cargando && estado.registros.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : estado.registros.length === 0 ? (
        <Vacio titulo="Sin registros" descripcion="No hay actividad con esos filtros." />
      ) : (
        <div className={cn("rounded-xl border bg-card transition-opacity", estado.cargando && "opacity-60")}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Cuándo</TableHead>
                <TableHead>Quién</TableHead>
                <TableHead>Qué</TableHead>
                <TableHead className="hidden lg:table-cell">Cambios</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estado.registros.map((r) => {
                const abierto = abiertos.has(r.id);
                const tieneDetalle = r.cambios.length > 0 || r.datosAntes || r.datosDespues;
                return (
                  <Fragment key={r.id}>
                    <TableRow className={cn(tieneDetalle && "cursor-pointer")} onClick={() => tieneDetalle && alternar(r.id)}>
                      <TableCell>
                        {tieneDetalle && (
                          <button type="button" aria-expanded={abierto} aria-label={abierto ? "Ocultar detalle" : "Ver detalle"} className="text-muted-foreground">
                            {abierto ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                          </button>
                        )}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{fechaHora.format(new Date(r.fecha))}</TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{r.usuario?.name || "Sistema"}</p>
                        <p className="text-xs text-muted-foreground">{r.usuario?.email}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant={TONO[r.accion] ?? "outline"}>{ACCIONES[r.accion] ?? r.accion}</Badge>
                          <span className="text-sm text-muted-foreground">{ENTIDADES[r.entidad] ?? r.entidad}</span>
                        </div>
                        <p className="mt-0.5 max-w-xs truncate text-sm font-medium">{r.entidadNombre}</p>
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {r.cambios.length ? r.cambios.map((c) => c.campo).join(", ") : "—"}
                      </TableCell>
                    </TableRow>
                    {abierto && (
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={5} className="whitespace-normal">
                          {r.cambios.length > 0 ? (
                            <div className="grid gap-2 py-2">
                              {r.cambios.map((c) => (
                                <div key={c.campo} className="grid gap-2 rounded-lg border bg-background p-3 text-sm md:grid-cols-[160px_1fr_1fr]">
                                  <p className="font-medium">{c.campo}</p>
                                  <div className="min-w-0">
                                    <p className="mb-1 text-xs text-muted-foreground">Antes</p>
                                    <Valor valor={c.antes} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="mb-1 text-xs text-muted-foreground">Después</p>
                                    <Valor valor={c.despues} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-2">
                              <p className="mb-1 text-xs text-muted-foreground">{r.datosDespues ? "Datos" : "Datos eliminados"}</p>
                              <Valor valor={r.datosDespues ?? r.datosAntes} />
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
