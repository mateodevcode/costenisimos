import { Skeleton } from "@/components/ui/skeleton";

export function PanelCargando({ completo = false }) {
  const contenido = (
    <div className="grid gap-4" aria-busy="true" aria-label="Cargando">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="grid gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
  if (!completo) return contenido;
  return (
    <div className="flex min-h-dvh">
      <div className="hidden w-64 border-r bg-sidebar p-3 md:block">
        <Skeleton className="mb-6 h-10 w-full" />
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="mb-2 h-8 w-full" />
        ))}
      </div>
      <div className="flex-1">
        <div className="h-14 border-b" />
        <div className="p-6">{contenido}</div>
      </div>
    </div>
  );
}
