"use client";

import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/master/ImageUploader";
import { Miniatura, coincide } from "@/components/master/comun";
import { fetchApi } from "@/lib/fetch-api";
import { MENU_TIPOS } from "@/lib/constants";

/** Crear/editar producto. `producto` null = crear. */
export function ProductoDialog({ abierto, onCerrar, producto, categorias, ingredientes, onGuardado }) {
  return (
    <Dialog open={abierto} onOpenChange={(o) => !o && onCerrar()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{producto ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          <DialogDescription>Los cambios se publican en la carta al guardar.</DialogDescription>
        </DialogHeader>
        {abierto && (
          <Formulario
            key={producto?.id ?? "nuevo"}
            producto={producto}
            categorias={categorias}
            ingredientes={ingredientes}
            onCerrar={onCerrar}
            onGuardado={onGuardado}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Formulario({ producto, categorias, ingredientes, onCerrar, onGuardado }) {
  const [form, setForm] = useState({
    nombre: producto?.nombre ?? "",
    precio: producto ? String(producto.precio) : "",
    categoria: producto?.categoria ?? categorias[0]?.id ?? "",
    descripcion: producto?.descripcion ?? "",
    disponibilidad: producto?.disponibilidad ?? true,
    menus: producto?.menus ?? [],
    ingredientes: producto?.ingredientes ?? [],
  });
  const [file, setFile] = useState(null);
  const [filtroIng, setFiltroIng] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const alternar = (k, id) => setForm((f) => ({ ...f, [k]: f[k].includes(id) ? f[k].filter((x) => x !== id) : [...f[k], id] }));

  // Los ya asociados al abrir van primero; el orden no salta mientras se marca/desmarca.
  const [iniciales] = useState(() => new Set(producto?.ingredientes ?? []));
  const ingredientesVisibles = useMemo(
    () =>
      [...ingredientes]
        .sort((a, b) => Number(iniciales.has(b.id)) - Number(iniciales.has(a.id)))
        .filter((i) => coincide(i.nombre, filtroIng)),
    [ingredientes, filtroIng, iniciales]
  );

  const precioNum = parseFloat(String(form.precio).replace(",", "."));
  const precioValido = form.precio !== "" && !Number.isNaN(precioNum) && precioNum >= 0;

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.nombre.trim()) return setError("El nombre es obligatorio.");
    if (!precioValido) return setError("El precio debe ser un número mayor o igual a 0.");
    if (!form.categoria) return setError("Selecciona una categoría.");
    if (!producto && !file) return setError("La imagen es obligatoria.");

    const fd = new FormData();
    if (producto) fd.set("id", producto.id);
    fd.set("nombre", form.nombre);
    fd.set("precio", String(precioNum));
    fd.set("categoria", form.categoria);
    fd.set("descripcion", form.descripcion);
    fd.set("disponibilidad", String(form.disponibilidad));
    fd.set("menus", JSON.stringify(form.menus));
    fd.set("ingredientes", JSON.stringify(form.ingredientes));
    if (file) fd.set("file", file);

    setCargando(true);
    try {
      await fetchApi("/api/productos", { method: producto ? "PUT" : "POST", body: fd });
      toast.success(producto ? "Producto actualizado." : "Producto creado.");
      onGuardado();
      onCerrar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (!categorias.length) {
    return <p className="text-sm text-muted-foreground">Primero crea al menos una categoría en la pestaña “Categorías”.</p>;
  }

  return (
    <form onSubmit={enviar} className="grid gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-[1fr_220px]">
        <div className="grid content-start gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="p-nombre">Nombre *</Label>
            <Input id="p-nombre" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} maxLength={80} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="p-precio">Precio *</Label>
              <Input
                id="p-precio"
                inputMode="decimal"
                value={form.precio}
                onChange={(e) => set("precio", e.target.value)}
                aria-invalid={form.precio !== "" && !precioValido}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-categoria">Categoría *</Label>
              <Select value={form.categoria} onValueChange={(v) => set("categoria", v)}>
                <SelectTrigger id="p-categoria" className="w-full">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="p-desc">Descripción</Label>
            <Textarea id="p-desc" rows={3} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} maxLength={600} />
          </div>
        </div>
        <ImageUploader value={file} onChange={setFile} actual={producto?.image} requerido={!producto} aspecto="aspect-square" />
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium">Menús en los que aparece</legend>
        <div className="flex flex-wrap gap-4">
          {MENU_TIPOS.map((m) => (
            <label key={m.id} className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.menus.includes(m.id)} onCheckedChange={() => alternar("menus", m.id)} />
              {m.nombre}
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Sin selección, el producto aparece en todos los menús.</p>
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium">
          Ingredientes <span className="font-normal text-muted-foreground">({form.ingredientes.length} seleccionados)</span>
        </legend>
        {ingredientes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay ingredientes. Créalos en la pestaña “Ingredientes”.</p>
        ) : (
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={filtroIng} onChange={(e) => setFiltroIng(e.target.value)} placeholder="Buscar ingrediente" className="pl-9" aria-label="Buscar ingrediente" />
            </div>
            <ul className="grid max-h-52 gap-1 overflow-y-auto rounded-lg border p-2 sm:grid-cols-2">
              {ingredientesVisibles.map((i) => (
                <li key={i.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-sm hover:bg-muted">
                    <Checkbox checked={form.ingredientes.includes(i.id)} onCheckedChange={() => alternar("ingredientes", i.id)} />
                    <Miniatura src={i.imagen} className="size-7" redonda />
                    <span className="truncate">{i.nombre}</span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}
      </fieldset>

      <label className="flex items-center justify-between gap-4 rounded-lg border p-3 text-sm">
        <span>
          <span className="block font-medium">Disponible</span>
          <span className="text-muted-foreground">Si lo desactivas, aparece como “Agotado”.</span>
        </span>
        <Switch checked={form.disponibilidad} onCheckedChange={(v) => set("disponibilidad", v)} />
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
          {producto ? "Guardar cambios" : "Crear producto"}
        </Button>
      </DialogFooter>
    </form>
  );
}
