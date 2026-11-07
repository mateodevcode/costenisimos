"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuthDialogs } from "@/components/auth/AuthDialogs";
import { Campo, MedidorPassword, PasswordInput } from "@/components/auth/campos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { fetchApi } from "@/lib/fetch-api";
import { PASSWORD_MENSAJE, passwordValida } from "@/lib/auth/password";
import { cn } from "@/lib/utils";

const CLAVE = "recuperacion";
const PASOS = ["Correo", "Código", "Nueva contraseña"];

function Pasos({ actual }) {
  return (
    <ol className="mb-6 flex items-center gap-2 text-xs" aria-label="Progreso">
      {PASOS.map((p, i) => (
        <li key={p} className="flex flex-1 items-center gap-2" aria-current={i === actual ? "step" : undefined}>
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
              i < actual && "border-transparent bg-foreground text-background",
              i === actual && "border-foreground text-foreground",
              i > actual && "text-muted-foreground"
            )}
          >
            {i + 1}
          </span>
          <span className={cn("hidden sm:inline", i === actual ? "font-medium" : "text-muted-foreground")}>{p}</span>
          {i < PASOS.length - 1 && <span className="h-px flex-1 bg-border" />}
        </li>
      ))}
    </ol>
  );
}

function ErrorTexto({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {children}
    </p>
  );
}

/** Pasos 1 y 2: correo → código. Al validar, guarda el resetToken en sessionStorage (nunca en la URL). */
export function SolicitarCodigo() {
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [cargando, setCargando] = useState(false);

  const pedir = async (e) => {
    e?.preventDefault();
    setError("");
    setCargando(true);
    try {
      await fetchApi("/api/auth/password/generar-codigo", { method: "POST", body: { email } });
      setAviso("Si el correo está registrado, recibirás un código de 6 dígitos. Revisa también tu carpeta de spam.");
      setPaso(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const validar = async (e) => {
    e?.preventDefault();
    setError("");
    setCargando(true);
    try {
      const data = await fetchApi("/api/auth/password/validar-codigo", { method: "POST", body: { email, codigo } });
      sessionStorage.setItem(CLAVE, JSON.stringify({ resetToken: data.resetToken, email, t: Date.now() }));
      router.push("/restablecer-contrasena");
    } catch (err) {
      setError(err.message);
      setCodigo("");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <Pasos actual={paso} />
      {paso === 0 ? (
        <form onSubmit={pedir} className="grid gap-4" noValidate>
          <p className="text-sm text-muted-foreground">Escribe el correo de tu cuenta y te enviaremos un código para crear una nueva contraseña.</p>
          <Campo label="Correo electrónico">
            {(p) => <Input {...p} type="email" autoComplete="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />}
          </Campo>
          <ErrorTexto>{error}</ErrorTexto>
          <Button type="submit" disabled={cargando || !email.includes("@")}>
            {cargando && <Loader2 className="animate-spin" />}
            Enviar código
          </Button>
        </form>
      ) : (
        <form onSubmit={validar} className="grid gap-4" noValidate>
          <div className="flex gap-3 rounded-lg border bg-muted/40 p-3 text-sm">
            <MailCheck className="mt-0.5 size-4 shrink-0" />
            <p>{aviso}</p>
          </div>
          <div className="grid gap-2">
            <label htmlFor="codigo-otp" className="text-sm font-medium">
              Código de verificación
            </label>
            <InputOTP id="codigo-otp" maxLength={6} inputMode="numeric" pattern="^[0-9]*$" value={codigo} onChange={setCodigo} autoFocus>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <ErrorTexto>{error}</ErrorTexto>
          <Button type="submit" disabled={cargando || codigo.length !== 6}>
            {cargando && <Loader2 className="animate-spin" />}
            Verificar código
          </Button>
          <div className="flex justify-between text-sm">
            <button type="button" className="text-muted-foreground underline-offset-4 hover:underline" onClick={() => { setPaso(0); setError(""); setCodigo(""); }}>
              Cambiar correo
            </button>
            <button type="button" className="text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50" disabled={cargando} onClick={() => pedir()}>
              Reenviar código
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const leerSesion = () => {
  try {
    const raw = sessionStorage.getItem(CLAVE);
    if (!raw) return null;
    const datos = JSON.parse(raw);
    // El resetToken vive 10 minutos.
    if (!datos?.resetToken || Date.now() - datos.t > 10 * 60 * 1000) return null;
    return raw;
  } catch {
    return null;
  }
};
const suscribir = () => () => {};

/** Paso 3: nueva contraseña. */
export function NuevaPassword() {
  const raw = useSyncExternalStore(suscribir, leerSesion, () => undefined);
  const { abrir } = useAuthDialogs();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [listo, setListo] = useState(false);

  if (raw === undefined) return <Loader2 className="mx-auto animate-spin text-muted-foreground" />;

  if (listo) {
    return (
      <div className="grid justify-items-center gap-4 text-center">
        <CheckCircle2 className="size-10 text-green-600" />
        <p className="text-sm">Tu contraseña fue actualizada y tu cuenta quedó desbloqueada.</p>
        <Button
          onClick={() => {
            router.push("/");
            abrir("login");
          }}
        >
          Iniciar sesión
        </Button>
      </div>
    );
  }

  if (!raw) {
    return (
      <div className="grid gap-4 text-center text-sm">
        <p>La solicitud expiró o no es válida. Vuelve a pedir un código.</p>
        <Button asChild variant="outline">
          <Link href="/olvidaste-tu-contrasena">Solicitar código</Link>
        </Button>
      </div>
    );
  }

  const { resetToken } = JSON.parse(raw);

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    if (!passwordValida(password)) return setError(PASSWORD_MENSAJE);
    if (password !== confirmar) return setError("Las contraseñas no coinciden.");
    setCargando(true);
    try {
      await fetchApi("/api/auth/password/restablecer", { method: "POST", body: { resetToken, password } });
      sessionStorage.removeItem(CLAVE);
      toast.success("Contraseña actualizada.");
      setListo(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <Pasos actual={2} />
      <form onSubmit={enviar} className="grid gap-4" noValidate>
        <Campo label="Nueva contraseña">
          {(p) => <PasswordInput {...p} autoComplete="new-password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />}
        </Campo>
        <MedidorPassword password={password} />
        <Campo label="Confirmar contraseña" error={confirmar && confirmar !== password ? "Las contraseñas no coinciden." : ""}>
          {(p) => <PasswordInput {...p} autoComplete="new-password" required value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />}
        </Campo>
        <ErrorTexto>{error}</ErrorTexto>
        <Button type="submit" disabled={cargando || !passwordValida(password) || password !== confirmar}>
          {cargando && <Loader2 className="animate-spin" />}
          Guardar contraseña
        </Button>
      </form>
    </div>
  );
}
