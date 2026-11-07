import { REDES } from "@/components/public/iconos";
import { cn } from "@/lib/utils";

/** Enlaces a redes configuradas en site.redes. */
export function Redes({ redes = {}, className, itemClassName }) {
  const activas = REDES.filter((r) => redes?.[r.id]);
  if (!activas.length) return null;
  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {activas.map(({ id, nombre, Icono }) => (
        <li key={id}>
          <a
            href={redes[id]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={nombre}
            className={cn("flex size-10 items-center justify-center rounded-full transition hover:scale-105", itemClassName)}
          >
            <Icono className="size-5" />
          </a>
        </li>
      ))}
    </ul>
  );
}
