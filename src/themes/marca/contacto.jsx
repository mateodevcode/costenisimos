"use client";

// Piezas interactivas de contacto: copiar número y formulario de reserva que abre WhatsApp.
// No crean pedidos ni reservas en el sistema: solo arman el mensaje.

import { useId, useState } from "react";
import { Check, Copy, Send } from "lucide-react";
import { toast } from "sonner";
import { whatsappCon } from "@/themes/marca/datos";
import { cn } from "@/lib/utils";

export function CopiarNumero({ numero, className, children }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(String(numero).replace(/\s/g, ""));
      setCopiado(true);
      toast.success("Número copiado.");
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("No se pudo copiar el número.");
    }
  };
  return (
    <button type="button" onClick={copiar} className={cn("inline-flex items-center gap-2", className)}>
      {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
      {children ?? (copiado ? "Copiado" : "Copiar número")}
    </button>
  );
}

const hoyISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

/**
 * Formulario de reserva → WhatsApp. `estilos` permite a cada tema vestirlo:
 * { form, campo, label, input, boton }.
 */
export function ReservaWhatsApp({ site, estilos = {}, textoBoton = "Enviar por WhatsApp" }) {
  const id = useId();
  const [f, setF] = useState({ nombre: "", fecha: "", hora: "", personas: "2", nota: "" });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const enviar = (e) => {
    e.preventDefault();
    if (!f.nombre.trim() || !f.fecha || !f.hora) {
      toast.error("Completa nombre, fecha y hora.");
      return;
    }
    const fecha = new Date(`${f.fecha}T12:00:00`).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
    const mensaje =
      `Hola ${site?.nombre ?? ""}, quiero reservar una mesa.\n` +
      `• Nombre: ${f.nombre.trim()}\n• Fecha: ${fecha}\n• Hora: ${f.hora}\n• Personas: ${f.personas}` +
      (f.nota.trim() ? `\n• Nota: ${f.nota.trim()}` : "");
    const href = whatsappCon(site, mensaje);
    if (!href) {
      toast.error("No hay un número de WhatsApp configurado.");
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const s = {
    form: "grid gap-4 sm:grid-cols-2",
    campo: "grid gap-1.5",
    label: "text-sm font-semibold",
    input: "h-12 rounded-xl border bg-white/90 px-4 text-base outline-none focus-visible:ring-2",
    boton: "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-bold",
    ...estilos,
  };

  return (
    <form onSubmit={enviar} className={s.form} noValidate>
      <div className={cn(s.campo, "sm:col-span-2")}>
        <label htmlFor={`${id}-n`} className={s.label}>
          Nombre
        </label>
        <input id={`${id}-n`} className={s.input} value={f.nombre} onChange={set("nombre")} autoComplete="name" required />
      </div>
      <div className={s.campo}>
        <label htmlFor={`${id}-f`} className={s.label}>
          Fecha
        </label>
        <input id={`${id}-f`} type="date" min={hoyISO()} className={s.input} value={f.fecha} onChange={set("fecha")} required />
      </div>
      <div className={s.campo}>
        <label htmlFor={`${id}-h`} className={s.label}>
          Hora
        </label>
        <input id={`${id}-h`} type="time" className={s.input} value={f.hora} onChange={set("hora")} required />
      </div>
      <div className={s.campo}>
        <label htmlFor={`${id}-p`} className={s.label}>
          Personas
        </label>
        <select id={`${id}-p`} className={s.input} value={f.personas} onChange={set("personas")}>
          {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div className={s.campo}>
        <label htmlFor={`${id}-o`} className={s.label}>
          Nota (opcional)
        </label>
        <input id={`${id}-o`} className={s.input} value={f.nota} onChange={set("nota")} placeholder="Cumpleaños, silla de bebé…" />
      </div>
      <button type="submit" className={cn(s.boton, "sm:col-span-2")}>
        <Send className="size-4" />
        {textoBoton}
      </button>
    </form>
  );
}
