"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Encabezado, Miniatura, Vacio } from "@/components/master/comun";
import { ConfirmarBorrado } from "@/components/master/ConfirmarBorrado";
import { ImageUploader } from "@/components/master/ImageUploader";
import { fetchApi } from "@/lib/fetch-api";
import { formatearPrecio } from "@/lib/utils";

/** ISO → "AAAA-MM-DD" en hora de Colombia (para el input de fecha). */
const aFechaInput = (iso) => (iso ? new Date(new Date(iso).getTime() - 5 * 3600e3).toISOString().slice(0, 10) : "");
const fechaLegible = (iso) =>
  iso ? new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Bogota" }) : "";

function estado(p) {
  if (!p.activa) return { texto: "Oculta", variante: "outline" };
  if (p.hasta && new Date(p.hasta) < new Date()) return { texto: "Vencida", variante: "destructive" };
  return { texto: "Visible", variante: "secondary" };
}

export function PromocionesView({ promociones, moneda }) {
  const router = useRouter();
  const refrescar = () => router.refresh();
  // dialogo: { item: objeto|null }
  const [dialogo, setDialogo] = useState(null);
  const [borrar, setBorrar] = useState(null);

  const alternarActiva = async (p, activa) => {
    const fd = new FormData();
    fd.set("id", p.id);
    fd.set("activa", String(activa));
    try {
      await fetchApi("/api/promociones", { method: "PUT", body: fd });
      toast.success(activa ? `${p.nombre} visible en la web.` : `${p.nombre} oculta.`);
      refrescar();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmarBorrado = async () => {
    try {
      await fetchApi(`/api/promociones?id=${encodeURIComponent(borrar.id)}`, { method: "DELETE" });
      toast.success(`${borrar.nombre} eliminada.`);
      refrescar();
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  return (
    <div>
      <Encabezado titulo="Promociones" descripcion="Promociones y combos que aparecen en la portada. Puedes ocultarlas o ponerles fecha de fin.">
        <Button onClick={() => setDialogo({ item: null })}>
          <Plus /> Nueva promoción
        </Button>
      </Encabezado>

      {promociones.length === 0 ? (
        <Vacio titulo="No hay promociones" descripcion="Crea la primera: un combo, una promo de temporada o un 2x1." />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Promoción</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="hidden md:table-cell">Hasta</TableHead>
                <TableHead className="hidden sm:table-cell">Estado</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promociones.map((p) => {
                const e = estado(p);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Miniatura src={p.imagen} className="w-16" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{p.nombre}</p>
                          {p.etiqueta && <p className="truncate text-xs text-muted-foreground">{p.etiqueta}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{p.precio !== null ? formatearPrecio(p.precio, moneda) : "—"}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{p.hasta ? fechaLegible(p.hasta) : "Sin fecha"}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={e.variante}>{e.texto}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch checked={p.activa} onCheckedChange={(v) => alternarActiva(p, v)} aria-label={`Mostrar ${p.nombre} en la web`} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Acciones para ${p.nombre}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setDialogo({ item: p })}>
                            <Pencil /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => setBorrar(p)}>
                            <Trash2 /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={Boolean(dialogo)} onOpenChange={(o) => !o && setDialogo(null)}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogo?.item ? "Editar promoción" : "Nueva promoción"}</DialogTitle>
            <DialogDescription>Los cambios se publican en la portada al guardar.</DialogDescription>
          </DialogHeader>
          {dialogo && <Formulario key={dialogo.item?.id ?? "nueva"} promo={dialogo.item} onCerrar={() => setDialogo(null)} onGuardado={refrescar} />}
        </DialogContent>
      </Dialog>

      <ConfirmarBorrado
        abierto={Boolean(borrar)}
        onCerrar={() => setBorrar(null)}
        titulo={borrar ? `¿Eliminar “${borrar.nombre}”?` : ""}
        descripcion="Esta acción no se puede deshacer. La imagen también se borrará."
        onConfirmar={confirmarBorrado}
      />
    </div>
  );
}

const numeroValido = (v) => v === "" || (!Number.isNaN(parseFloat(String(v).replace(",", "."))) && parseFloat(String(v).replace(",", ".")) >= 0);

function Formulario({ promo, onCerrar, onGuardado }) {
  const [form, setForm] = useState({
    nombre: promo?.nombre ?? "",
    etiqueta: promo?.etiqueta ?? "",
    descripcion: promo?.descripcion ?? "",
    precio: promo?.precio != null ? String(promo.precio) : "",
    precioAntes: promo?.precioAntes != null ? String(promo.precioAntes) : "",
    hasta: aFechaInput(promo?.hasta),
    activa: promo?.activa ?? true,
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    if (form.nombre.trim().length < 2) return setError("El nombre es obligatorio.");
    if (!numeroValido(form.precio) || !numeroValido(form.precioAntes)) return setError("Los precios deben ser números mayores o iguales a 0.");
    if (!promo && !file) return setError("La imagen es obligatoria.");

    const fd = new FormData();
    if (promo) fd.set("id", promo.id);
    for (const k of ["nombre", "etiqueta", "descripcion", "precio", "precioAntes", "hasta"]) fd.set(k, form[k]);
    fd.set("activa", String(form.activa));
    if (file) fd.set("file", file);

    setCargando(true);
    try {
      await fetchApi("/api/promociones", { method: promo ? "PUT" : "POST", body: fd });
      toast.success(promo ? "Promoción actualizada." : "Promoción creada.");
      onGuardado();
      onCerrar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="grid gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-[1fr_240px]">
        <div className="grid content-start gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="pr-nombre">Nombre *</Label>
            <Input id="pr-nombre" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} maxLength={80} placeholder="Combo familiar" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pr-etiqueta">Etiqueta</Label>
            <Input id="pr-etiqueta" value={form.etiqueta} onChange={(e) => set("etiqueta", e.target.value)} maxLength={24} placeholder="Combo, Navidad, 2x1…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="pr-precio">Precio</Label>
              <Input id="pr-precio" inputMode="decimal" value={form.precio} onChange={(e) => set("precio", e.target.value)} aria-invalid={!numeroValido(form.precio)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pr-antes">Precio antes</Label>
              <Input id="pr-antes" inputMode="decimal" value={form.precioAntes} onChange={(e) => set("precioAntes", e.target.value)} aria-invalid={!numeroValido(form.precioAntes)} />
            </div>
          </div>
          <p className="-mt-2 text-xs text-muted-foreground">Ambos son opcionales. “Precio antes” se muestra tachado.</p>
        </div>
        <ImageUploader value={file} onChange={setFile} actual={promo?.imagen} requerido={!promo} aspecto="aspect-[4/3]" />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="pr-desc">Descripción</Label>
        <Textarea id="pr-desc" rows={3} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} maxLength={600} placeholder="Qué incluye el combo o en qué consiste la promo." />
      </div>

      <div className="grid gap-1.5 sm:max-w-xs">
        <Label htmlFor="pr-hasta">Visible hasta</Label>
        <Input id="pr-hasta" type="date" value={form.hasta} onChange={(e) => set("hasta", e.target.value)} />
        <p className="text-xs text-muted-foreground">Opcional. Después de ese día se oculta sola.</p>
      </div>

      <label className="flex items-center justify-between gap-4 rounded-lg border p-3 text-sm">
        <span>
          <span className="block font-medium">Visible en la web</span>
          <span className="text-muted-foreground">Desactívala para guardarla sin mostrarla.</span>
        </span>
        <Switch checked={form.activa} onCheckedChange={(v) => set("activa", v)} />
      </label>

      {error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCerrar} disabled={cargando}>
          Cancelar
        </Button>
        <Button type="submit" disabled={cargando}>
          {cargando && <Loader2 className="animate-spin" />}
          {promo ? "Guardar cambios" : "Crear promoción"}
        </Button>
      </DialogFooter>
    </form>
  );
}
