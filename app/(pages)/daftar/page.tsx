"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { FormError, KodePemulihan, Kolom } from "@/components/akun/form-ui";
import { useFlow } from "@/components/flow-provider";
import { api, ApiError } from "@/lib/api-client";
import { pesanError } from "@/lib/pesan-template";

export default function DaftarPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const { state } = useFlow();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kode, setKode] = useState<string | null>(null);

  async function daftar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await api.register({ email: email.trim(), password });
      setKode(r.recoveryCode); // server sudah membuat sesi login
    } catch (err) {
      setError(err instanceof ApiError ? err.message : pesanError(0));
    } finally {
      setLoading(false);
    }
  }

  async function lanjut() {
    // Halaman dipertahankan Next (Activity) saat berpindah: hapus kode agar benar-benar tampil sekali.
    setKode(null);
    setPassword("");
    await refresh();
    router.push(state.gap ? "/hasil" : "/mulai");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="display">
          Buat <span className="hl">akun</span>
        </h1>
        <p className="text-text-muted">Cukup email dan password. Tidak ada email verifikasi.</p>
      </div>
      {kode ? (
        <KodePemulihan kode={kode} onLanjut={lanjut} labelLanjut={state.gap ? "Lanjut ke hasilku" : "Mulai analisis"} />
      ) : (
        <>
          <form className="card flex flex-col gap-4" onSubmit={daftar}>
            <Kolom label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Kolom
              label="Password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              hint="Minimal 8 karakter."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormError message={error} />
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? "Membuat akun…" : "Daftar"}
            </button>
          </form>
          <p className="text-[15px]">
            Sudah punya akun?{" "}
            <Link href="/masuk" className="inline-flex min-h-11 items-center font-bold text-primary-text underline underline-offset-2">
              Masuk
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
