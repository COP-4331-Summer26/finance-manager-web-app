import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, setToken, clearToken, getToken } from "../api/client";
import type { UserSummary } from "../types";

interface AuthContextValue {
  user: UserSummary | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  /** Kicks off registration — does NOT log the user in. The backend always
   *  requires verification after registering, so success here means "show
   *  the code-entry modal", regardless of any specific flag in the response. */
  register: (name: string, email: string, password: string) => Promise<{ message: string; email: string }>;
  /** Completes signup after the user enters the code from their email — logs them in on success. */
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .getMe()
      .then((u) => setUser({ id: u.id, email: u.email, name: u.name }))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.register({ name, email, password });
    return res;
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string) => {
    const res = await api.verifyEmail({ email, code });
    setToken(res.token);
    setUser(res.user);
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    await api.resendVerification({ email });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyEmail, resendVerification, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
