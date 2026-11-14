"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { EmptyState, ErrorCard } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";
import { AKUN, LABEL_TAHAP, formatWaktu, pesanError } from "@/lib/pesan-template";
import type { AnalysisSummary } from "@/lib/schemas";


export default function RiwayatPage() {
  const { user } = useAuth();
  const [list, setList] = useState<AnalysisSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .listAnalyses()
      .then(setList)
      .catch((e) => setError(e instanceof ApiError ? e.message : pesanError(0)));
  }, [user]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="display">
        <span className="hl">Riwayat</span> progresmu
      </h1>
      {user === undefined ? (
        <div className="skeleton h-32" aria-busy="true" />
      ) : !user ? (
        <EmptyState
          judul="Masuk untuk melihat riwayat"
          action={
            <Link href="/masuk" className="btn btn-primary w-full sm:w-auto">
              Masuk
            </Link>
          }
        >
          {AKUN.perluMasuk}
        </EmptyState>
      ) : error ? (
        <ErrorCard message={error} />
      ) : !list ? (
        <div className="skeleton h-32" aria-busy="true" />
      ) : list.length === 0 ? (
        <EmptyState
          judul="Riwayatmu masih kosong"
          action={
            <Link href="/mulai" className="btn btn-primary w-full sm:w-auto">
              Mulai analisis
            </Link>
          }
        >
          Setelah analisis, tekan &ldquo;Simpan hasil&rdquo; di layar Hasil supaya muncul di sini.
        </EmptyState>
      ) : (
        <ol className="flex flex-col gap-3">
          {list.map((a) => (
            <li key={a.id}>
              <Link href={`/riwayat/${a.id}`} className="card flex items-center gap-4 hover:shadow-(--shadow-btn-hover)">
                <span className="grid size-14 shrink-0 place-items-center rounded-btn border-2 border-ink bg-primary font-display text-[22px] font-extrabold tabular-nums">
                  {a.skor}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-semibold wrap-break-word">{a.target_posisi}</span>
                  <span className="text-[13px] text-text-muted">
                    {LABEL_TAHAP[a.tahap]} · {formatWaktu(a.created_at)}
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0" aria-hidden="true" />
                <span className="sr-only">Buka detail, skor kecocokan {a.skor}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
