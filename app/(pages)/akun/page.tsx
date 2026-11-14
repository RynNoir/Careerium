"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { History, LogOut, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { FormError } from "@/components/akun/form-ui";
import { useFlow } from "@/components/flow-provider";
import { EmptyState } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";
import { AKUN, pesanError } from "@/lib/pesan-template";

export default function AkunPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const { update } = useFlow();
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user === undefined) return <div className="skeleton h-40" aria-busy="true" />;
  if (!user)
    return (
      <EmptyState
        judul="Kamu belum masuk"
        action={
          <Link href="/masuk" className="btn btn-primary w-full sm:w-auto">
            Masuk
          </Link>
        }
      >
        {AKUN.perluMasuk}
      </EmptyState>
    );

  async function selesai(aksi: () => Promise<unknown>) {
    setError(null);
    setLoading(true);
    try {
      await aksi();
      // Hasil di browser tetap ada (mode tamu), tapi tautannya ke akun diputus.
      update({ savedId: null, roadmapItemIds: {}, attemptSaved: false });
      setUser(null);
      router.push("/mulai");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : pesanError(0));
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <h1 className="display">
        <span className="hl">Akun</span>mu
      </h1>
      <section className="card flex flex-col gap-3">
        <p className="label-caps">Masuk sebagai</p>
        <p className="font-semibold break-all">{user.email}</p>
        <Link href="/riwayat" className="btn btn-primary w-full">
          <History className="size-4" aria-hidden="true" /> Lihat riwayat
        </Link>
        <button type="button" className="btn btn-secondary w-full" disabled={loading} onClick={() => selesai(api.logout)}>
          <LogOut className="size-4" aria-hidden="true" /> Keluar
        </button>
      </section>

      <section className="card flex flex-col gap-3">
        <h2 className="text-[17px]">Hapus akun</h2>
        {konfirmasi ? (
          <>
            <p role="alert" className="text-[15px]">
              {AKUN.hapusKonfirmasi}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                className="btn btn-secondary w-full text-error sm:w-auto"
                disabled={loading}
                onClick={() => selesai(api.deleteAccount)}
              >
                <Trash2 className="size-4" aria-hidden="true" /> Ya, hapus permanen
              </button>
              <button type="button" className="btn btn-secondary w-full sm:w-auto" disabled={loading} onClick={() => setKonfirmasi(false)}>
                Batal
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[15px] text-text-muted">Menghapus email, hasil analisis, roadmap, dan riwayat wawancaramu.</p>
            <button type="button" className="btn btn-secondary w-full sm:w-auto sm:self-start" onClick={() => setKonfirmasi(true)}>
              <Trash2 className="size-4" aria-hidden="true" /> Hapus akun
            </button>
          </>
        )}
        <FormError message={error} />
      </section>
    </div>
  );
}
