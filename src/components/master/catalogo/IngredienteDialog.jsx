"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader } from "@/components/master/ImageUploader";
import { fetchApi } from "@/lib/fetch-api";

const SIN_PRODUCTO = "ninguno";

export function IngredienteDialog({ abierto, onCerrar, ingrediente, productos, onGuardado }) {
  return (
    <Dialog open={abierto} onOpenChange={(o) => !o && onCerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{ingrediente ? "Editar ingrediente" : "Nuevo ingrediente"}</DialogTitle>
          <DialogDescription>Se muestra en el detalle de los productos que lo usan.</DialogDescription>
        </DialogHeader>
        {abierto && (
          <Formulario key={ingrediente?.id ?? "nuevo"} ingrediente={ingrediente} productos={productos} onCerrar={onCerrar} onGuardado={onGuardado} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Formulario({ ingrediente, productos, onCerrar, onGuardado }) {
  const [nombre, setNombre] = useState(ingrediente?.nombre ?? "");
  const [cantidad, setCantidad] = useState(ingrediente?.cantidad ?? "");
  const [productoId, setProductoId] = useState(SIN_PRODUCTO);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    if (nombre.trim().length < 2) return setError("El nombre debe tener al menos 2 caracteres.");
    if (!ingrediente && !file) return setError("La imagen es obligatoria.");
    const fd = new FormData();
    if (ingrediente) fd.set("id", ingrediente.id);
    fd.set("nombre", nombre);
    fd.set("cantidad", cantidad);
    if (!ingrediente && productoId !== SIN_PRODUCTO) fd.set("productoId", productoId);
    if (file) fd.set("file", file);
    setCargando(true);
    try {
      await fetchApi("/api/ingredientes", { method: ingrediente ? "PUT" : "POST", body: fd });
      toast.success(ingrediente ? "Ingrediente actualizado." : "Ingrediente creado.");
      onGuardado();
      onCerrar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="grid gap-4" noValidate>
      <div className="grid grid-cols-[1fr_120px] gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="i-nombre">Nombre *</Label>
          <Input id="i-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={60} required autoFocus />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="i-cantidad">Cantidad</Label>
          <Input id="i-cantidad" value={cantidad} onChange={(e) => setCantidad(e.target.value)} maxLength={40} placeholder="Ej. 200 g" />
        </div>
      </div>
      {!ingrediente && (
        <div className="grid gap-1.5">
          <Label htmlFor="i-producto">Asociar a un producto (opcional)</Label>
          <Select value={productoId} onValueChange={setProductoId}>
            <SelectTrigger id="i-producto" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SIN_PRODUCTO}>Ninguno</SelectItem>
              {productos.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <ImageUploader value={file} onChange={setFile} actual={ingrediente?.imagen} requerido={!ingrediente} aspecto="aspect-square max-w-48" />
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
          {ingrediente ? "Guardar cambios" : "Crear ingrediente"}
        </Button>
      </DialogFooter>
    </form>
  );
}
