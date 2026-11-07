import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-7xl font-semibold text-muted-foreground/40">404</p>
      <h1 className="font-display text-2xl font-semibold">No encontramos esta página</h1>
      <p className="max-w-sm text-muted-foreground">Es posible que el enlace esté mal escrito o que la página ya no exista.</p>
      <div className="flex gap-2">
        <Button asChild className="rounded-full">
          <Link href="/">Ir al inicio</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/menu">Ver el menú</Link>
        </Button>
      </div>
    </main>
  );
}
