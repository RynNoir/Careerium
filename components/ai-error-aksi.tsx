"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import type { ApiError } from "@/lib/api-client";

const KODE_MENUNGGU = ["llm_kuota", "llm_lambat", "llm_unavailable"];

/**
 * Arahan di bawah pesan error AI: "Coba lagi" (dengan hitung mundur dari server, jadi pengguna tidak menunggu
 * tanpa kepastian) dan "Pakai mode demo". Tidak tampil untuk error lain (mis. masukan tidak valid).
 */
export function AiErrorAksi({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const kode = (error as Partial<ApiError> | null)?.kode;
  const awal = (error as Partial<ApiError> | null)?.cobaLagiDetik ?? 0;
  // Kartu error dibuat ulang tiap percobaan (halaman mengosongkan error lebih dulu), jadi nilai awal cukup.
  const [sisa, setSisa] = useState(awal);

  useEffect(() => {
    if (awal <= 0) return;
    const t = setInterval(() => setSisa((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [awal]);

  const bisaCoba = !!kode && KODE_MENUNGGU.includes(kode) && !!onRetry;
  if (!bisaCoba && kode !== "too_many") return null;

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      {bisaCoba && (
        <button type="button" className="btn btn-primary w-full sm:w-auto" disabled={sisa > 0} onClick={onRetry}>
          <RotateCcw className="size-4" aria-hidden="true" /> {sisa > 0 ? `Coba lagi dalam ${sisa} detik` : "Coba lagi"}
        </button>
      )}
      <Link href="/mulai" className="btn btn-secondary w-full sm:w-auto">
        <Sparkles className="size-4" aria-hidden="true" /> Pakai mode demo
      </Link>
    </div>
  );
}
