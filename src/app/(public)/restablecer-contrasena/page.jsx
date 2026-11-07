import { NuevaPassword } from "@/components/auth/Recuperacion";

export const metadata = {
  title: "Restablecer contraseña",
  description: "Crea una nueva contraseña para tu cuenta.",
  robots: { index: false },
};

export default function RestablecerContrasenaPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:py-20">
      <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="mb-1 font-display text-2xl font-semibold">Nueva contraseña</h1>
        <p className="mb-6 text-sm text-muted-foreground">Elige una contraseña segura que no uses en otros sitios.</p>
        <NuevaPassword />
      </div>
    </main>
  );
}
