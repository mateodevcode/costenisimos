"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const MAX_BYTES = 10 * 1024 * 1024;
const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const LADO_MAX_CLIENTE = 2000;

/**
 * Reduce imágenes grandes en el navegador antes de subirlas (máx. 2000 px, JPEG 0.9).
 * Mantiene las peticiones pequeñas en plataformas con límite de body. El servidor vuelve a optimizar con sharp.
 */
async function reducir(file) {
  if (file.type === "image/gif" || typeof createImageBitmap !== "function") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const escala = Math.min(1, LADO_MAX_CLIENTE / Math.max(bitmap.width, bitmap.height));
    if (escala === 1 && file.size < 2 * 1024 * 1024) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.9));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/**
 * Selector de imagen con vista previa local y validación (solo imágenes, máx. 10 MB).
 * @param {{ value: File|null, onChange: (f: File|null) => void, actual?: string, requerido?: boolean, label?: string, aspecto?: string }} props
 */
export function ImageUploader({ value, onChange, actual, requerido = false, label = "Imagen", aspecto = "aspect-[4/3]", className }) {
  const id = useId();
  const input = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);
  const urlActual = useRef(null);

  // Libera la URL temporal al desmontar.
  useEffect(() => () => urlActual.current && URL.revokeObjectURL(urlActual.current), []);

  const publicarPreview = (file) => {
    if (urlActual.current) URL.revokeObjectURL(urlActual.current);
    urlActual.current = file ? URL.createObjectURL(file) : null;
    setPreview(urlActual.current);
  };

  const elegir = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    if (!TIPOS.includes(file.type)) return setError("Formato no permitido. Usa JPG, PNG, WebP, GIF o AVIF.");
    if (file.size > MAX_BYTES) return setError("La imagen supera el límite de 10 MB.");
    setProcesando(true);
    try {
      const final = await reducir(file);
      publicarPreview(final);
      onChange(final);
    } finally {
      setProcesando(false);
    }
  };

  const quitar = () => {
    publicarPreview(null);
    onChange(null);
  };

  const mostrar = value ? preview : actual;

  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {requerido && <span className="text-destructive"> *</span>}
      </label>
      <div className={cn("relative overflow-hidden rounded-xl border border-dashed bg-muted/40", aspecto)}>
        {mostrar ? (
          // eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:) o URL existente
          <img src={mostrar} alt="Vista previa" className="absolute inset-0 size-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-muted"
          >
            {procesando ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
            Seleccionar imagen
          </button>
        )}
        {mostrar && (
          <div className="absolute right-2 bottom-2 flex gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => input.current?.click()} disabled={procesando}>
              {procesando && <Loader2 className="animate-spin" />}
              Cambiar
            </Button>
            {value && (
              <Button type="button" size="icon-sm" variant="secondary" onClick={quitar} aria-label="Quitar imagen nueva">
                <X />
              </Button>
            )}
          </div>
        )}
      </div>
      <input ref={input} id={id} type="file" accept={TIPOS.join(",")} className="sr-only" onChange={elegir} />
      <p className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>{error || "JPG, PNG, WebP, GIF o AVIF. Máximo 10 MB."}</p>
    </div>
  );
}
