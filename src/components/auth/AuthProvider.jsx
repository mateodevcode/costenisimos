"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchApi } from "@/lib/fetch-api";
import { ROLES_PANEL } from "@/lib/constants";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authenticated | unauthenticated

  const refreshUser = useCallback(async () => {
    try {
      const data = await fetchApi("/api/auth/me");
      setUser(data.usuario);
      setStatus("authenticated");
      return data.usuario;
    } catch {
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  useEffect(() => {
    let activo = true;
    fetchApi("/api/auth/me")
      .then((data) => {
        if (!activo) return;
        setUser(data.usuario);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!activo) return;
        setUser(null);
        setStatus("unauthenticated");
      });
    return () => {
      activo = false;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await fetchApi("/api/auth/login", { method: "POST", body: { email, password } });
    setUser(data.usuario);
    setStatus("authenticated");
    return data.usuario;
  }, []);

  const loginGoogle = useCallback(async (credential) => {
    const data = await fetchApi("/api/auth/google", { method: "POST", body: { credential } });
    setUser(data.usuario);
    setStatus("authenticated");
    return data.usuario;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetchApi("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  /** Limpia el estado local sin llamar al servidor (p. ej. tras eliminar la cuenta). */
  const clearUser = useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      login,
      loginGoogle,
      logout,
      refreshUser,
      clearUser,
      puedeEntrarPanel: Boolean(user && ROLES_PANEL.includes(user.role)),
    }),
    [user, status, login, loginGoogle, logout, refreshUser, clearUser]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  return ctx;
}
