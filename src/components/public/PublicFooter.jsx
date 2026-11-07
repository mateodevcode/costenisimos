import Link from "next/link";
import { Redes } from "@/components/public/Redes";

export function PublicFooter({ site }) {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-1">
          <p className="font-display text-lg font-semibold">{site.nombre}</p>
          {site.direccion && <p className="text-sm text-muted-foreground">{site.direccion}</p>}
          {site.telefono && (
            <a href={`tel:${site.telefono.replace(/\s/g, "")}`} className="text-sm text-muted-foreground hover:text-foreground">
              {site.telefono}
            </a>
          )}
        </div>
        <Redes redes={site.redes} itemClassName="bg-background text-foreground border" />
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <Link href="/menu" className="hover:text-foreground">
            Menú
          </Link>
          <Link href="/nosotros" className="hover:text-foreground">
            Nosotros
          </Link>
          <Link href="/politicas-de-privacidad" className="hover:text-foreground">
            Política de privacidad
          </Link>
        </nav>
      </div>
      <p className="border-t py-4 text-center text-xs text-muted-foreground">
        © {site.nombre}. Todos los derechos reservados.
      </p>
    </footer>
  );
}
