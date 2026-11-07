import { logoPath, logoViewBox } from "@/themes/marca/svg-datos";
import { cn } from "@/lib/utils";

/** Logotipo de Costeñisimos (trazado de la plantilla). Hereda el color con `currentColor`. */
export function Logo({ className, titulo = "Costeñisimos Restaurante", conSubtitulo = false, subtituloClassName }) {
  return (
    <span className={cn("inline-flex flex-col items-center leading-none", className)} role="img" aria-label={titulo}>
      <svg viewBox={logoViewBox} className="h-auto w-full" aria-hidden focusable="false">
        <path fill="currentColor" fillRule="evenodd" d={logoPath} />
      </svg>
      {conSubtitulo && (
        <span aria-hidden className={cn("-mt-1 font-yellowtail text-[0.42em] leading-none", subtituloClassName)}>
          Restaurante
        </span>
      )}
    </span>
  );
}
