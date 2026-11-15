"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Encabezado, Vacio, coincide } from "@/components/master/comun";
import { fetchApi } from "@/lib/fetch-api";
import { ROLES } from "@/lib/constants";
import { iniciales } from "@/lib/utils";

const ETIQUETA = { usuario: "Usuario", empleado: "Empleado", admin: "Admin", superadmin: "Superadmin" };
/** Parte del correo antes de la "@": es lo que se escribe para confirmar el borrado. */
const usuarioDeCorreo = (email = "") => String(email).split("@")[0].trim().toLowerCase();

const fechaHora = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" });

export function UsuariosView({ usuarios, miId, puedeGestionar }) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [rol, setRol] = useState("todos");
  const [pendiente, setPendiente] = useState(null);
  const [borrar, setBorrar] = useState(null);

  const visibles = usuarios.filter((u) => (rol === "todos" || u.role === rol) && coincide(`${u.name} ${u.email} ${u.telefono}`, busqueda));

  const actualizar = async (u, cambios, mensaje) => {
    setPendiente(u.id);
    try {
      await fetchApi(`/api/admin/usuarios/${u.id}`, { method: "PATCH", body: cambios });
      toast.success(mensaje);
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPendiente(null);
    }
  };

  return (
    <div>
      <Encabezado
        titulo="Usuarios"
        descripcion={puedeGestionar ? "Gestiona roles y bloqueos de las cuentas." : "Consulta de cuentas registradas (solo lectura)."}
      >
        <Badge variant="secondary">{usuarios.length} cuentas</Badge>
      </Encabezado>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, correo o teléfono" aria-label="Buscar usuario" className="pl-9" />
        </div>
        <Select value={rol} onValueChange={setRol}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Filtrar por rol">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los roles</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {ETIQUETA[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {visibles.length === 0 ? (
        <Vacio titulo="Sin usuarios" descripcion="Ninguna cuenta coincide con los filtros." />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="hidden md:table-cell">Último ingreso</TableHead>
                <TableHead className="text-right">Bloqueado</TableHead>
                {puedeGestionar && (
                  <TableHead className="w-12">
                    <span className="sr-only">Eliminar</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibles.map((u) => {
                const soyYo = u.id === miId;
                const editable = puedeGestionar && !soyYo;
                return (
                  <TableRow key={u.id} className={u.bloqueado ? "bg-destructive/5" : undefined}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          {u.imageUrl && <AvatarImage src={u.imageUrl} alt="" referrerPolicy="no-referrer" />}
                          <AvatarFallback>{iniciales(u.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {u.name} {soyYo && <span className="text-xs font-normal text-muted-foreground">(tú)</span>}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {editable ? (
                        <Select
                          value={u.role}
                          disabled={pendiente === u.id}
                          onValueChange={(v) => actualizar(u, { role: v }, `Rol de ${u.name} cambiado a ${ETIQUETA[v]}.`)}
                        >
                          <SelectTrigger size="sm" className="w-36" aria-label={`Rol de ${u.name}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {ETIQUETA[r]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={u.role === "usuario" ? "outline" : "secondary"}>{ETIQUETA[u.role] ?? u.role}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {u.ultimoLogin ? fechaHora.format(new Date(u.ultimoLogin)) : "Nunca"}
                    </TableCell>
                    <TableCell className="text-right">
                      {editable ? (
                        <Switch
                          checked={u.bloqueado}
                          disabled={pendiente === u.id}
                          aria-label={u.bloqueado ? `Desbloquear a ${u.name}` : `Bloquear a ${u.name}`}
                          onCheckedChange={(v) => actualizar(u, { bloqueado: v }, v ? `${u.name} fue bloqueado.` : `${u.name} fue desbloqueado.`)}
                        />
                      ) : (
                        <Badge variant={u.bloqueado ? "destructive" : "outline"}>{u.bloqueado ? "Sí" : "No"}</Badge>
                      )}
                    </TableCell>
                    {puedeGestionar && (
                      <TableCell className="text-right">
                        {!soyYo && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive"
                            aria-label={`Eliminar la cuenta de ${u.name}`}
                            onClick={() => setBorrar(u)}
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {puedeGestionar && (
        <EliminarUsuarioDialog
          usuario={borrar}
          onCerrar={() => setBorrar(null)}
          onEliminado={() => {
            setBorrar(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/** Confirmación fuerte: hay que escribir el usuario del correo (lo que va antes de la "@"). */
function EliminarUsuarioDialog({ usuario, onCerrar, onEliminado }) {
  return (
    <Dialog open={Boolean(usuario)} onOpenChange={(o) => !o && onCerrar()}>
      <DialogContent className="sm:max-w-md">
        {usuario && <FormularioEliminar key={usuario.id} usuario={usuario} onCerrar={onCerrar} onEliminado={onEliminado} />}
      </DialogContent>
    </Dialog>
  );
}

function FormularioEliminar({ usuario, onCerrar, onEliminado }) {
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const clave = usuarioDeCorreo(usuario.email);
  const coincideClave = texto.trim().toLowerCase() === clave;

  const enviar = async (e) => {
    e.preventDefault();
    if (!coincideClave) return;
    setCargando(true);
    try {
      await fetchApi(`/api/admin/usuarios/${usuario.id}`, { method: "DELETE", body: { confirmacion: texto.trim() } });
      toast.success(`Cuenta de ${usuario.email} eliminada.`);
      onEliminado();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>¿Eliminar esta cuenta?</DialogTitle>
        <DialogDescription>
          Se eliminará la cuenta de <strong className="text-foreground">{usuario.name}</strong> ({usuario.email}) y se cerrarán sus
          sesiones. Esta acción no se puede deshacer.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-1.5">
        <label htmlFor="confirmar-usuario" className="text-sm">
          Para confirmar, escribe <code className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold text-foreground">{clave}</code>
        </label>
        <Input
          id="confirmar-usuario"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={clave}
          aria-invalid={texto !== "" && !coincideClave}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCerrar} disabled={cargando}>
          Cancelar
        </Button>
        <Button type="submit" variant="destructive" disabled={!coincideClave || cargando}>
          {cargando ? <Loader2 className="animate-spin" /> : <Trash2 />}
          Eliminar cuenta
        </Button>
      </DialogFooter>
    </form>
  );
}
