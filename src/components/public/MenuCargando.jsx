import { Skeleton } from "@/components/ui/skeleton";

export function MenuCargando() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8" aria-busy="true" aria-label="Cargando menú">
      <Skeleton className="mb-6 h-10 w-48" />
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-72 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
