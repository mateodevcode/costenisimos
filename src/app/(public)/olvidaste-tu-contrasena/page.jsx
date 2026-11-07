import { SolicitarCodigo } from "@/components/auth/Recuperacion";

export const metadata = {
  title: "Recuperar contraseña",
  description: "Solicita un código para restablecer la contraseña de tu cuenta.",
  robots: { index: false },
};

export default function OlvidasteTuContrasenaPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:py-20">
      <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="mb-1 font-display text-2xl font-semibold">¿Olvidaste tu contraseña?</h1>
        <p className="mb-6 text-sm text-muted-foreground">Te ayudamos a recuperar el acceso en tres pasos.</p>
        <SolicitarCodigo />
      </div>
    </main>
  );
}
