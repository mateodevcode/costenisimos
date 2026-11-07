import { cn } from "@/lib/utils";

/** Mapa de Google embebido (sin API key) a partir de site.mapsQuery o la dirección. */
export function Mapa({ query, titulo = "Ubicación", className }) {
  if (!query) return null;
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-muted", className)}>
      <iframe
        title={titulo}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full min-h-72 w-full border-0"
        allowFullScreen
      />
    </div>
  );
}

export function enlaceMapa(query) {
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
}
