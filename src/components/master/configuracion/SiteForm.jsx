"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { MAX_BYTES } from "@/components/master/ImageUploader";
import { fetchApi } from "@/lib/fetch-api";

const ZONAS = [
  "America/Bogota",
  "America/Mexico_City",
  "America/Lima",
  "America/Guayaquil",
  "America/Panama",
  "America/Caracas",
  "America/Santiago",
  "America/Argentina/Buenos_Aires",
  "America/New_York",
  "Europe/Madrid",
];
const MONEDAS = [
  { id: "COP", nombre: "Peso colombiano (COP)" },
  { id: "USD", nombre: "Dólar estadounidense (USD)" },
  { id: "MXN", nombre: "Peso mexicano (MXN)" },
  { id: "PEN", nombre: "Sol peruano (PEN)" },
  { id: "CLP", nombre: "Peso chileno (CLP)" },
  { id: "ARS", nombre: "Peso argentino (ARS)" },
  { id: "EUR", nombre: "Euro (EUR)" },
];

async function subirImagenSitio(file, tipo) {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") throw new Error("Usa una imagen JPG, PNG, WebP, GIF o AVIF.");
  if (file.size > MAX_BYTES) throw new Error("La imagen supera el límite de 10 MB.");
  const fd = new FormData();
  fd.set("tipo", tipo);
  fd.set("file", file);
  const data = await fetchApi("/api/configuracion/imagen", { method: "POST", body: fd });
  return data.url;
}

function Seccion({ titulo, descripcion, children }) {
  return (
    <section className="grid gap-4 md:grid-cols-[220px_1fr]">
      <div>
        <h3 className="font-semibold">{titulo}</h3>
        {descripcion && <p className="text-sm text-muted-foreground">{descripcion}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Campo({ id, label, children, ayuda }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>}
    </div>
  );
}

function BotonSubir({ onArchivo, children, disabled }) {
  const ref = useRef(null);
  const [subiendo, setSubiendo] = useState(false);
  return (
    <>
      <Button type="button" variant="outline" size="sm" disabled={disabled || subiendo} onClick={() => ref.current?.click()}>
        {subiendo ? <Loader2 className="animate-spin" /> : <ImagePlus />}
        {children}
      </Button>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setSubiendo(true);
          try {
            await onArchivo(file);
          } catch (err) {
            toast.error(err.message);
          } finally {
            setSubiendo(false);
          }
        }}
      />
    </>
  );
}

export function SiteForm({ inicial }) {
  const router = useRouter();
  const [s, setS] = useState(inicial);
  const [guardando, setGuardando] = useState(false);

  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));
  const setIn = (grupo, k, v) => setS((p) => ({ ...p, [grupo]: { ...p[grupo], [k]: v } }));
  const txt = (k) => (e) => set(k, e.target.value);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const value = {
        ...s,
        whatsapp: s.whatsapp.filter((w) => w.numero.trim()),
        nosotros: { ...s.nosotros, parrafos: s.nosotros.parrafos.map((p) => p.trim()).filter(Boolean) },
      };
      await fetchApi("/api/configuracion", { method: "PATCH", body: { updates: [{ key: "site", value }] } });
      setS(value);
      toast.success("Datos del restaurante guardados.");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={guardar} className="grid gap-8">
      <Seccion titulo="Restaurante" descripcion="Nombre y textos que se muestran en la carta.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="s-nombre" label="Nombre *">
            <Input id="s-nombre" value={s.nombre} onChange={txt("nombre")} maxLength={80} required />
          </Campo>
          <Campo id="s-slogan" label="Slogan">
            <Input id="s-slogan" value={s.slogan} onChange={txt("slogan")} maxLength={120} />
          </Campo>
        </div>
        <Campo id="s-desc" label="Descripción" ayuda="Se usa en buscadores y en la portada.">
          <Textarea id="s-desc" rows={2} value={s.descripcion} onChange={txt("descripcion")} maxLength={300} />
        </Campo>
      </Seccion>
      <Separator />

      <Seccion titulo="Contacto y ubicación">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="s-tel" label="Teléfono">
            <Input id="s-tel" type="tel" value={s.telefono} onChange={txt("telefono")} maxLength={30} />
          </Campo>
          <Campo id="s-email" label="Correo">
            <Input id="s-email" type="email" value={s.email} onChange={txt("email")} maxLength={200} />
          </Campo>
        </div>
        <Campo id="s-dir" label="Dirección">
          <Input id="s-dir" value={s.direccion} onChange={txt("direccion")} maxLength={200} />
        </Campo>
        <Campo id="s-maps" label="Búsqueda en Google Maps" ayuda="Texto o coordenadas que ubican el local en el mapa (si se deja vacío se usa la dirección).">
          <Input id="s-maps" value={s.mapsQuery} onChange={txt("mapsQuery")} maxLength={200} />
        </Campo>
      </Seccion>
      <Separator />

      <Seccion titulo="WhatsApp" descripcion="Hasta 5 números. Con varios, el botón flotante muestra un selector.">
        {s.whatsapp.map((w, i) => (
          <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[200px_1fr_auto] sm:items-end">
            <Campo id={`wa-n-${i}`} label="Número (con indicativo)">
              <Input
                id={`wa-n-${i}`}
                value={w.numero}
                inputMode="tel"
                placeholder="573001234567"
                onChange={(e) => set("whatsapp", s.whatsapp.map((x, j) => (j === i ? { ...x, numero: e.target.value } : x)))}
              />
            </Campo>
            <Campo id={`wa-m-${i}`} label="Mensaje inicial">
              <Input
                id={`wa-m-${i}`}
                value={w.mensaje}
                maxLength={300}
                onChange={(e) => set("whatsapp", s.whatsapp.map((x, j) => (j === i ? { ...x, mensaje: e.target.value } : x)))}
              />
            </Campo>
            <Button type="button" variant="ghost" size="icon" aria-label="Quitar número" onClick={() => set("whatsapp", s.whatsapp.filter((_, j) => j !== i))}>
              <Trash2 />
            </Button>
          </div>
        ))}
        {s.whatsapp.length < 5 && (
          <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => set("whatsapp", [...s.whatsapp, { numero: "", mensaje: "" }])}>
            <Plus /> Agregar número
          </Button>
        )}
      </Seccion>
      <Separator />

      <Seccion titulo="Redes sociales" descripcion="URL completa del perfil (https://…).">
        {[
          ["instagram", "Instagram"],
          ["facebook", "Facebook"],
          ["tiktok", "TikTok"],
        ].map(([k, label]) => (
          <Campo key={k} id={`r-${k}`} label={label}>
            <Input id={`r-${k}`} type="url" value={s.redes[k]} onChange={(e) => setIn("redes", k, e.target.value)} placeholder="https://" />
          </Campo>
        ))}
      </Seccion>
      <Separator />

      <Seccion titulo="Marca" descripcion="Logo y colores de la carta pública.">
        <div className="flex items-center gap-4">
          <div className="flex size-20 items-center justify-center overflow-hidden rounded-xl border bg-muted">
            {s.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- vista previa de una URL arbitraria
              <img src={s.logoUrl} alt="Logo" className="size-full object-cover" />
            ) : (
              <span className="text-xs text-muted-foreground">Sin logo</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <BotonSubir onArchivo={async (f) => set("logoUrl", await subirImagenSitio(f, "logo"))}>{s.logoUrl ? "Cambiar logo" : "Subir logo"}</BotonSubir>
            {s.logoUrl && (
              <Button type="button" variant="ghost" size="sm" onClick={() => set("logoUrl", "")}>
                Quitar
              </Button>
            )}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["colorPrimario", "Color primario"],
            ["colorSecundario", "Color secundario"],
          ].map(([k, label]) => (
            <Campo key={k} id={`c-${k}`} label={label}>
              <div className="flex gap-2">
                <input
                  type="color"
                  aria-label={`${label} (selector)`}
                  value={/^#[0-9a-f]{6}$/i.test(s[k]) ? s[k] : "#000000"}
                  onChange={(e) => set(k, e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-md border bg-transparent p-1"
                />
                <Input id={`c-${k}`} value={s[k]} onChange={txt(k)} maxLength={7} className="font-mono uppercase" />
              </div>
            </Campo>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="s-zona" label="Zona horaria" ayuda="Define qué menú se preselecciona según la hora.">
            <Select value={s.zonaHoraria} onValueChange={(v) => set("zonaHoraria", v)}>
              <SelectTrigger id="s-zona" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...new Set([s.zonaHoraria, ...ZONAS])].map((z) => (
                  <SelectItem key={z} value={z}>
                    {z}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>
          <Campo id="s-moneda" label="Moneda">
            <Select value={s.moneda} onValueChange={(v) => set("moneda", v)}>
              <SelectTrigger id="s-moneda" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(MONEDAS.some((m) => m.id === s.moneda) ? MONEDAS : [{ id: s.moneda, nombre: s.moneda }, ...MONEDAS]).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>
        </div>
      </Seccion>
      <Separator />

      <Seccion titulo="Nosotros" descripcion="Contenido de la página /nosotros.">
        <Campo id="n-titulo" label="Título">
          <Input id="n-titulo" value={s.nosotros.titulo} onChange={(e) => setIn("nosotros", "titulo", e.target.value)} maxLength={80} />
        </Campo>
        <div className="grid gap-2">
          <Label>Párrafos</Label>
          {s.nosotros.parrafos.map((p, i) => (
            <div key={i} className="flex gap-2">
              <Textarea
                aria-label={`Párrafo ${i + 1}`}
                rows={3}
                value={p}
                maxLength={1500}
                onChange={(e) => setIn("nosotros", "parrafos", s.nosotros.parrafos.map((x, j) => (j === i ? e.target.value : x)))}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Quitar párrafo ${i + 1}`}
                onClick={() => setIn("nosotros", "parrafos", s.nosotros.parrafos.filter((_, j) => j !== i))}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
          {s.nosotros.parrafos.length < 20 && (
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setIn("nosotros", "parrafos", [...s.nosotros.parrafos, ""])}>
              <Plus /> Agregar párrafo
            </Button>
          )}
        </div>
        <div className="grid gap-2">
          <Label>Galería ({s.nosotros.imagenes.length}/12)</Label>
          {s.nosotros.imagenes.length > 0 && (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {s.nosotros.imagenes.map((url) => (
                <li key={url} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element -- miniatura de vista previa */}
                  <img src={url} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    aria-label="Quitar imagen"
                    onClick={() => setIn("nosotros", "imagenes", s.nosotros.imagenes.filter((u) => u !== url))}
                    className="absolute top-1 right-1 rounded-full bg-background/90 p-1 shadow"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <BotonSubir
            disabled={s.nosotros.imagenes.length >= 12}
            onArchivo={async (f) => {
              const url = await subirImagenSitio(f, "nosotros");
              setS((p) => ({ ...p, nosotros: { ...p.nosotros, imagenes: [...p.nosotros.imagenes, url] } }));
            }}
          >
            Agregar imagen
          </BotonSubir>
        </div>
      </Seccion>
      <Separator />

      <Seccion titulo="Políticas de privacidad" descripcion="Datos del responsable del tratamiento de datos.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="p-razon" label="Razón social">
            <Input id="p-razon" value={s.politicas.razonSocial} onChange={(e) => setIn("politicas", "razonSocial", e.target.value)} maxLength={150} />
          </Campo>
          <Campo id="p-nit" label="NIT">
            <Input id="p-nit" value={s.politicas.nit} onChange={(e) => setIn("politicas", "nit", e.target.value)} maxLength={40} />
          </Campo>
        </div>
        <Campo id="p-correo" label="Correo de contacto para datos personales">
          <Input id="p-correo" type="email" value={s.politicas.correoContacto} onChange={(e) => setIn("politicas", "correoContacto", e.target.value)} />
        </Campo>
        <Campo id="p-extra" label="Texto adicional">
          <Textarea id="p-extra" rows={4} value={s.politicas.textoExtra} onChange={(e) => setIn("politicas", "textoExtra", e.target.value)} maxLength={5000} />
        </Campo>
      </Seccion>

      <div className="sticky bottom-0 -mx-4 flex justify-end border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <Button type="submit" disabled={guardando}>
          {guardando ? <Loader2 className="animate-spin" /> : <Save />}
          Guardar datos del restaurante
        </Button>
      </div>
    </form>
  );
}
