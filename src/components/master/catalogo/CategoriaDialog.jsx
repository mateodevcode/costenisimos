"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/master/ImageUploader";
import { fetchApi } from "@/lib/fetch-api";

export function CategoriaDialog({ abierto, onCerrar, categoria, onGuardado }) {
  return (
    <Dialog open={abierto} onOpenChange={(o) => !o && onCerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{categoria ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
          <DialogDescription>La imagen se usa como portada de la categoría en la carta.</DialogDescription>
        </DialogHeader>
        {abierto && <Formulario key={categoria?.id ?? "nueva"} categoria={categoria} onCerrar={onCerrar} onGuardado={onGuardado} />}
      </DialogContent>
    </Dialog>
  );
}

function Formulario({ categoria, onCerrar, onGuardado }) {
  const [nombre, setNombre] = useState(categoria?.nombre ?? "");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    if (nombre.trim().length < 2) return setError("El nombre debe tener al menos 2 caracteres.");
    if (!categoria && !file) return setError("La imagen es obligatoria.");
    const fd = new FormData();
    if (categoria) fd.set("id", categoria.id);
    fd.set("nombre", nombre);
    if (file) fd.set("file", file);
    setCargando(true);
    try {
      await fetchApi("/api/categorias", { method: categoria ? "PUT" : "POST", body: fd });
      toast.success(categoria ? "Categoría actualizada." : "Categoría creada.");
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
      <div className="grid gap-1.5">
        <Label htmlFor="c-nombre">Nombre *</Label>
        <Input id="c-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={60} required autoFocus />
      </div>
      <ImageUploader value={file} onChange={setFile} actual={categoria?.imagen} requerido={!categoria} aspecto="aspect-[3/1]" />
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
          {categoria ? "Guardar cambios" : "Crear categoría"}
        </Button>
      </DialogFooter>
    </form>
  );
}
