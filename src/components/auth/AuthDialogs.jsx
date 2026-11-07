"use client";

import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { Campo, MedidorPassword, PasswordInput } from "@/components/auth/campos";
import { GoogleButton, googleHabilitado } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EVENTO_SESION_EXPIRADA, fetchApi } from "@/lib/fetch-api";
import { PASSWORD_MENSAJE, passwordValida } from "@/lib/auth/password";
import { ROLES_PANEL } from "@/lib/constants";

const DialogsContext = createContext(null);

/** Solo rutas internas: evita redirecciones abiertas. */
function rutaSegura(url) {
  if (typeof url !== "string" || !url.startsWith("/") || url.startsWith("//") || url.startsWith("/\\")) return null;
  return url;
}

export function AuthDialogsProvider({ children }) {
  const [abierto, setAbierto] = useState(null); // login | registro | perfil | password | eliminar
  const [callbackUrl, setCallbackUrl] = useState(null);

  const abrir = useCallback((cual, opciones = {}) => {
    if (opciones.callbackUrl !== undefined) setCallbackUrl(rutaSegura(opciones.callbackUrl));
    setAbierto(cual);
  }, []);
  const cerrar = useCallback(() => setAbierto(null), []);

  const value = useMemo(() => ({ abrir, cerrar }), [abrir, cerrar]);
  const { clearUser } = useAuth();

  // Si una acción falla porque la sesión no se pudo renovar, se pide iniciar sesión de nuevo
  // encima de la pantalla actual (los formularios abiertos no se pierden).
  useEffect(() => {
    const alExpirar = () => {
      clearUser();
      toast.error("Tu sesión expiró. Inicia sesión de nuevo y vuelve a intentarlo.");
      setAbierto("login");
    };
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
  }, [clearUser]);

  return (
    <DialogsContext value={value}>
      {children}
      <Suspense fallback={null}>
        <ParametroLogin abrir={abrir} />
      </Suspense>
      <LoginDialog
        open={abierto === "login"}
        onOpenChange={(o) => !o && cerrar()}
        onRegistro={() => setAbierto("registro")}
        callbackUrl={callbackUrl}
        onListo={() => {
          setCallbackUrl(null);
          cerrar();
        }}
      />
      <RegistroDialog open={abierto === "registro"} onOpenChange={(o) => !o && cerrar()} onLogin={() => setAbierto("login")} />
      <PerfilDialog open={abierto === "perfil"} onOpenChange={(o) => !o && cerrar()} />
      <PasswordDialog open={abierto === "password"} onOpenChange={(o) => !o && cerrar()} />
      <EliminarCuentaDialog open={abierto === "eliminar"} onOpenChange={(o) => !o && cerrar()} />
    </DialogsContext>
  );
}

export function useAuthDialogs() {
  const ctx = useContext(DialogsContext);
  if (!ctx) throw new Error("useAuthDialogs debe usarse dentro de <AuthDialogsProvider>.");
  return ctx;
}

/**
 * `/?login=1&callbackUrl=/master/...`: si la sesión puede renovarse en silencio, vuelve al destino;
 * si no, abre el modal de login.
 */
function ParametroLogin({ abrir }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { status, user } = useAuth();
  const procesado = useRef(false);

  useEffect(() => {
    if (params.get("login") !== "1" || status === "loading" || procesado.current) return;
    procesado.current = true;
    const destino = rutaSegura(params.get("callbackUrl"));
    const limpia = new URLSearchParams(params);
    limpia.delete("login");
    limpia.delete("callbackUrl");
    const actual = `${pathname}${limpia.size ? `?${limpia}` : ""}`;

    if (status === "authenticated") {
      const puedePanel = ROLES_PANEL.includes(user?.role);
      if (destino && (!destino.startsWith("/master") || puedePanel)) router.replace(destino);
      else router.replace(actual);
      return;
    }
    router.replace(actual, { scroll: false });
    abrir("login", { callbackUrl: destino });
  }, [params, status, user, pathname, router, abrir]);

  return null;
}

function Separador() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
    </div>
  );
}

function LoginDialog({ open, onOpenChange, onRegistro, callbackUrl, onListo }) {
  const { login, loginGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const despuesDeEntrar = (usuario) => {
    toast.success(`¡Hola, ${usuario.name.split(" ")[0]}!`);
    setPassword("");
    setError("");
    const destino = callbackUrl;
    onListo();
    if (destino && (!destino.startsWith("/master") || ROLES_PANEL.includes(usuario.role))) router.push(destino);
    else router.refresh();
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      despuesDeEntrar(await login({ email, password }));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const conGoogle = async (credential) => {
    setError("");
    setCargando(true);
    try {
      despuesDeEntrar(await loginGoogle(credential));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar sesión</DialogTitle>
          <DialogDescription>Ingresa con tu correo y contraseña o con tu cuenta de Google.</DialogDescription>
        </DialogHeader>
        {open && googleHabilitado && (
          <>
            {/* Sin One Tap: al cerrar el modal, Google registra la cancelación de su prompt como error en consola. */}
            <GoogleButton onCredential={conGoogle} texto="signin_with" />
            <Separador />
          </>
        )}
        <form onSubmit={enviar} className="grid gap-4" noValidate>
          <Campo label="Correo electrónico">
            {(p) => (
              <Input {...p} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            )}
          </Campo>
          <Campo label="Contraseña">
            {(p) => (
              <PasswordInput {...p} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            )}
          </Campo>
          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={cargando || !email || !password}>
            {cargando && <Loader2 className="animate-spin" />}
            Ingresar
          </Button>
        </form>
        <div className="flex flex-col items-center gap-2 text-sm">
          <Link href="/olvidaste-tu-contrasena" className="text-muted-foreground underline-offset-4 hover:underline" onClick={() => onOpenChange(false)}>
            ¿Olvidaste tu contraseña?
          </Link>
          <p className="text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <button type="button" className="font-medium text-foreground underline-offset-4 hover:underline" onClick={onRegistro}>
              Regístrate
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RegistroDialog({ open, onOpenChange, onLogin }) {
  const { login } = useAuth();
  const router = useRouter();
  const vacio = { name: "", email: "", telefono: "", password: "", confirmar: "" };
  const [form, setForm] = useState(vacio);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const errorPassword = form.password && !passwordValida(form.password) ? PASSWORD_MENSAJE : "";
  const errorConfirmar = form.confirmar && form.confirmar !== form.password ? "Las contraseñas no coinciden." : "";

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    if (!passwordValida(form.password)) return setError(PASSWORD_MENSAJE);
    if (form.password !== form.confirmar) return setError("Las contraseñas no coinciden.");
    setCargando(true);
    try {
      const body = { name: form.name, email: form.email, password: form.password };
      if (form.telefono.trim()) body.telefono = form.telefono.trim();
      await fetchApi("/api/usuarios", { method: "POST", body });
      await login({ email: form.email, password: form.password });
      toast.success("¡Cuenta creada! Ya iniciaste sesión.");
      setForm(vacio);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear cuenta</DialogTitle>
          <DialogDescription>Regístrate para guardar tus datos y acceder más rápido.</DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="grid gap-4" noValidate>
          <Campo label="Nombre">
            {(p) => <Input {...p} autoComplete="name" required value={form.name} onChange={set("name")} />}
          </Campo>
          <Campo label="Correo electrónico">
            {(p) => <Input {...p} type="email" autoComplete="email" required value={form.email} onChange={set("email")} />}
          </Campo>
          <Campo label="Teléfono (opcional)">
            {(p) => <Input {...p} type="tel" autoComplete="tel" value={form.telefono} onChange={set("telefono")} />}
          </Campo>
          <Campo label="Contraseña">
            {(p) => <PasswordInput {...p} autoComplete="new-password" required value={form.password} onChange={set("password")} />}
          </Campo>
          <MedidorPassword password={form.password} />
          <Campo label="Confirmar contraseña" error={errorConfirmar}>
            {(p) => <PasswordInput {...p} autoComplete="new-password" required value={form.confirmar} onChange={set("confirmar")} />}
          </Campo>
          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={cargando || !form.name || !form.email || Boolean(errorPassword) || Boolean(errorConfirmar) || !form.confirmar}>
            {cargando && <Loader2 className="animate-spin" />}
            Crear cuenta
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <button type="button" className="font-medium text-foreground underline-offset-4 hover:underline" onClick={onLogin}>
            Inicia sesión
          </button>
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Al registrarte aceptas nuestra{" "}
          <Link href="/politicas-de-privacidad" className="underline underline-offset-4" onClick={() => onOpenChange(false)}>
            política de privacidad
          </Link>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
}

function PerfilDialog({ open, onOpenChange }) {
  const { user } = useAuth();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mi perfil</DialogTitle>
          <DialogDescription>Actualiza tus datos personales.</DialogDescription>
        </DialogHeader>
        {open && user && <PerfilForm key={user.id} user={user} onListo={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function PerfilForm({ user, onListo }) {
  const { refreshUser } = useAuth();
  const router = useRouter();
  const esStaff = ROLES_PANEL.includes(user.role);
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    telefono: user.telefono || "",
    direccion: user.direccion || "",
    imageUrl: user.imageUrl || "",
    cargo: user.cargo || "",
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const body = { ...form };
      if (!esStaff) delete body.cargo;
      await fetchApi(`/api/usuarios/${user.id}`, { method: "PUT", body });
      await refreshUser();
      toast.success("Perfil actualizado.");
      onListo();
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="grid gap-4" noValidate>
      <Campo label="Nombre">{(p) => <Input {...p} autoComplete="name" required value={form.name} onChange={set("name")} />}</Campo>
      <Campo label="Correo electrónico">
        {(p) => <Input {...p} type="email" autoComplete="email" required value={form.email} onChange={set("email")} />}
      </Campo>
      <Campo label="Teléfono">{(p) => <Input {...p} type="tel" autoComplete="tel" value={form.telefono} onChange={set("telefono")} />}</Campo>
      <Campo label="Dirección">
        {(p) => <Input {...p} autoComplete="street-address" value={form.direccion} onChange={set("direccion")} />}
      </Campo>
      <Campo label="URL de foto (opcional)">
        {(p) => <Input {...p} type="url" inputMode="url" placeholder="https://…" value={form.imageUrl} onChange={set("imageUrl")} />}
      </Campo>
      {esStaff && <Campo label="Cargo">{(p) => <Input {...p} value={form.cargo} onChange={set("cargo")} />}</Campo>}
      {error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button type="submit" disabled={cargando || !form.name || !form.email}>
          {cargando && <Loader2 className="animate-spin" />}
          Guardar cambios
        </Button>
      </DialogFooter>
    </form>
  );
}

function PasswordDialog({ open, onOpenChange }) {
  const { user } = useAuth();
  const vacio = { passwordActual: "", passwordNueva: "", confirmar: "" };
  const [form, setForm] = useState(vacio);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const sinPassword = user && user.tienePassword === false;

  const cambiarOpen = (o) => {
    if (!o) {
      setForm(vacio);
      setError("");
    }
    onOpenChange(o);
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    if (!passwordValida(form.passwordNueva)) return setError(PASSWORD_MENSAJE);
    if (form.passwordNueva !== form.confirmar) return setError("Las contraseñas no coinciden.");
    setCargando(true);
    try {
      await fetchApi("/api/usuarios/cambiar-password", {
        method: "POST",
        body: { passwordActual: form.passwordActual, passwordNueva: form.passwordNueva },
      });
      toast.success("Contraseña actualizada. Se cerraron tus otras sesiones.");
      cambiarOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={cambiarOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogDescription>Por seguridad, se cerrarán tus sesiones en otros dispositivos.</DialogDescription>
        </DialogHeader>
        {sinPassword ? (
          <div className="grid gap-3 text-sm">
            <p>Tu cuenta usa Google y aún no tiene contraseña. Puedes crear una con la opción de recuperación.</p>
            <Button asChild variant="outline">
              <Link href="/olvidaste-tu-contrasena" onClick={() => cambiarOpen(false)}>
                Crear contraseña
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={enviar} className="grid gap-4" noValidate>
            <Campo label="Contraseña actual">
              {(p) => <PasswordInput {...p} autoComplete="current-password" required value={form.passwordActual} onChange={set("passwordActual")} />}
            </Campo>
            <Campo label="Nueva contraseña">
              {(p) => <PasswordInput {...p} autoComplete="new-password" required value={form.passwordNueva} onChange={set("passwordNueva")} />}
            </Campo>
            <MedidorPassword password={form.passwordNueva} />
            <Campo label="Confirmar nueva contraseña" error={form.confirmar && form.confirmar !== form.passwordNueva ? "Las contraseñas no coinciden." : ""}>
              {(p) => <PasswordInput {...p} autoComplete="new-password" required value={form.confirmar} onChange={set("confirmar")} />}
            </Campo>
            {error && (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={cargando || !form.passwordActual || !passwordValida(form.passwordNueva) || form.passwordNueva !== form.confirmar}>
                {cargando && <Loader2 className="animate-spin" />}
                Actualizar contraseña
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EliminarCuentaDialog({ open, onOpenChange }) {
  const { user, clearUser } = useAuth();
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  const eliminar = async (e) => {
    e.preventDefault();
    if (!user) return;
    setCargando(true);
    try {
      await fetchApi(`/api/usuarios/${user.id}`, { method: "DELETE" });
      clearUser();
      toast.success("Tu cuenta fue eliminada.");
      onOpenChange(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
          <AlertDialogDescription>
            Se borrarán tus datos personales y se cerrarán todas tus sesiones. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cargando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={eliminar} disabled={cargando} className="bg-destructive text-white hover:bg-destructive/90">
            {cargando && <Loader2 className="animate-spin" />}
            Eliminar cuenta
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
