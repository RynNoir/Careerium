"use client";

// Status login dari GET /api/auth/me (cookie httpOnly, otomatis terkirim same-origin).
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api-client";

type AuthCtx = {
  /** undefined = sedang dicek, null = tamu */
  user: { email: string } | null | undefined;
  refresh: () => Promise<void>;
  setUser: (u: { email: string } | null) => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthCtx["user"]>(undefined);

  const refresh = useCallback(async () => {
    try {
      setUser(await api.me());
    } catch {
      setUser(null); // server bermasalah: perlakukan sebagai tamu, alur tetap jalan
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cek sesi sekali saat aplikasi dimuat
    void refresh();
  }, [refresh]);

  const value = useMemo(() => ({ user, refresh, setUser }), [user, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
