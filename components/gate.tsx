"use client";

import { useFlow } from "./flow-provider";

/** Menahan isi halaman sampai state sesi selesai dibaca dari sessionStorage. */
export function FlowGate({ children }: { children: React.ReactNode }) {
  const { ready } = useFlow();
  if (!ready)
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <div className="skeleton h-8 w-2/3" />
        <div className="skeleton h-32" />
      </div>
    );
  return <>{children}</>;
}
