"use client";

import Link from "next/link";
import { LogIn, UserRound } from "lucide-react";
import { useAuth } from "./auth-provider";

/** Status login di header: tamu → "Masuk", login → email (ke halaman Akun). */
export function HeaderAkun() {
  const { user } = useAuth();
  if (user === undefined) return <span className="skeleton h-9 w-20" aria-hidden="true" />;
  if (!user)
    return (
      <Link href="/masuk" className="chip min-h-11 bg-surface">
        <LogIn className="size-4" aria-hidden="true" /> Masuk
      </Link>
    );
  return (
    <Link href="/akun" className="chip min-h-11 max-w-[55vw] bg-primary-soft" aria-label={`Akun: ${user.email}`}>
      <UserRound className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{user.email}</span>
    </Link>
  );
}
