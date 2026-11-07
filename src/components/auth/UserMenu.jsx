"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, LayoutDashboard, LogIn, LogOut, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthDialogs } from "@/components/auth/AuthDialogs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, iniciales } from "@/lib/utils";

/**
 * Botón "Ingresar" o menú de usuario (Perfil, Cambiar contraseña, Eliminar cuenta, Ir al panel, Cerrar sesión).
 * @param {{ variant?: "light" | "dark", mostrarPanel?: boolean, className?: string }} props
 */
export function UserMenu({ variant = "light", mostrarPanel = true, className }) {
  const { user, status, logout, puedeEntrarPanel } = useAuth();
  const { abrir } = useAuthDialogs();
  const router = useRouter();

  if (status === "loading") return <Skeleton className={cn("size-9 rounded-full", className)} />;

  if (!user) {
    return (
      <Button
        size="sm"
        variant={variant === "dark" ? "secondary" : "outline"}
        className={cn("rounded-full", className)}
        onClick={() => abrir("login")}
      >
        <LogIn />
        Ingresar
      </Button>
    );
  }

  const salir = async () => {
    await logout();
    toast.success("Sesión cerrada.");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn("rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
          aria-label="Menú de usuario"
        >
          <Avatar className="size-9 border">
            {user.imageUrl && <AvatarImage src={user.imageUrl} alt={user.name} referrerPolicy="no-referrer" />}
            <AvatarFallback>{iniciales(user.name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="grid">
          <span className="truncate">{user.name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {mostrarPanel && puedeEntrarPanel && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/master">
                <LayoutDashboard />
                Ir al panel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onSelect={() => abrir("perfil")}>
          <UserRound />
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => abrir("password")}>
          <KeyRound />
          Cambiar contraseña
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={() => abrir("eliminar")}>
          <Trash2 />
          Eliminar cuenta
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={salir}>
          <LogOut />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
