"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchApi } from "@/lib/fetch-api";

const CAMPOS = [
  { k: "horarioCocina", label: "Horario de cocina", placeholder: "Lunes a domingo, 7:00 a. m. – 10:00 p. m." },
  { k: "menuDesayuno", label: "Horario del menú desayuno", placeholder: "7:00 a. m. – 11:00 a. m." },
  { k: "menuDia", label: "Horario del menú del día", placeholder: "11:00 a. m. – 5:00 p. m." },
  { k: "menuNoche", label: "Horario del menú noche", placeholder: "5:00 p. m. – 10:00 p. m." },
];

export function MenuInfoForm({ inicial }) {
  const router = useRouter();
  const [form, setForm] = useState(inicial);
  const [guardando, setGuardando] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await fetchApi("/api/configuracion", { method: "PATCH", body: { updates: [{ key: "menu_info", value: form }] } });
      toast.success("Horarios guardados.");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={guardar} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {CAMPOS.map((c) => (
          <div key={c.k} className="grid gap-1.5">
            <Label htmlFor={`mi-${c.k}`}>{c.label}</Label>
            <Input id={`mi-${c.k}`} value={form[c.k]} onChange={set(c.k)} placeholder={c.placeholder} maxLength={300} />
          </div>
        ))}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="mi-alergenos">Nota sobre alérgenos</Label>
        <Textarea id="mi-alergenos" rows={2} value={form.alergenos} onChange={set("alergenos")} maxLength={600} />
      </div>
      <Button type="submit" className="w-fit" disabled={guardando}>
        {guardando ? <Loader2 className="animate-spin" /> : <Save />}
        Guardar horarios
      </Button>
    </form>
  );
}
