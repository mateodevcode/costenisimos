import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getSite } from "@/lib/config";
import { Galeria } from "@/components/public/Galeria";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata() {
  await connection();
  const site = await getSite();
  return {
    title: site.nosotros?.titulo || "Nosotros",
    description: site.nosotros?.parrafos?.[0]?.slice(0, 160) || `Conoce la historia de ${site.nombre}.`,
  };
}

async function Contenido() {
  await connection();
  const site = await getSite();
  const { titulo, parrafos = [], imagenes = [] } = site.nosotros || {};
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-14 md:py-20 lg:grid-cols-2 lg:items-start">
      <div className="lg:sticky lg:top-28">
        <p className="text-sm font-semibold tracking-wide text-brand uppercase">{site.nombre}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{titulo || "Nosotros"}</h1>
        <div className="mt-6 grid gap-4 text-lg leading-relaxed text-muted-foreground">
          {parrafos.length ? parrafos.map((p, i) => <p key={i}>{p}</p>) : <p>Pronto contaremos nuestra historia aquí.</p>}
        </div>
        <Button asChild className="mt-8 rounded-full bg-brand text-brand-foreground hover:bg-brand/90" size="lg">
          <Link href="/menu">Ver la carta</Link>
        </Button>
      </div>
      <Galeria imagenes={imagenes} titulo={titulo || site.nombre} />
    </main>
  );
}

export default function NosotrosPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto my-14 h-96 w-[calc(100%-2rem)] max-w-6xl rounded-3xl" />}>
      <Contenido />
    </Suspense>
  );
}
