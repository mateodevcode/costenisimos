"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Encabezado } from "@/components/master/comun";
import { TemaSelector } from "@/components/master/configuracion/TemaSelector";
import { MenuInfoForm } from "@/components/master/configuracion/MenuInfoForm";
import { SiteForm } from "@/components/master/configuracion/SiteForm";

function Bloque({ titulo, descripcion, accion, children }) {
  return (
    <section className="grid gap-4 rounded-2xl border bg-card p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{titulo}</h3>
          {descripcion && <p className="text-sm text-muted-foreground">{descripcion}</p>}
        </div>
        {accion}
      </div>
      {children}
    </section>
  );
}

function Ver({ href, children }) {
  return (
    <Button asChild variant="ghost" size="sm">
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children} <ExternalLink />
      </a>
    </Button>
  );
}

export function ConfiguracionView({ config, temasHome, temasMenu }) {
  return (
    <div className="grid max-w-5xl gap-6">
      <Encabezado titulo="Configuración" descripcion="Diseño de la carta, horarios y datos del restaurante." />

      <Bloque titulo="Página principal" descripcion="Diseño de la portada (/)." accion={<Ver href="/">Ver Home</Ver>}>
        <TemaSelector temas={temasHome} configKey="home_theme" valorActual={config.home_theme} />
      </Bloque>

      <Bloque titulo="Menú" descripcion="Diseño de la carta (/menu)." accion={<Ver href="/menu">Ver Menú</Ver>}>
        <TemaSelector temas={temasMenu} configKey="menu_theme" valorActual={config.menu_theme} />
      </Bloque>

      <Bloque titulo="Horarios y avisos del menú">
        <MenuInfoForm inicial={config.menu_info} />
      </Bloque>

      <Bloque titulo="Datos del restaurante">
        <SiteForm inicial={config.site} />
      </Bloque>
    </div>
  );
}
