"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { FormError, KodePemulihan, Kolom } from "@/components/akun/form-ui";
import { api, ApiError } from "@/lib/api-client";
import { pesanError } from "@/lib/pesan-template";

export default function LupaPasswordPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kode, setKode] = useState<string | null>(null);

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await api.reset({ email: email.trim(), recoveryCode: recoveryCode.trim(), newPassword });
      setKode(r.recoveryCode); // kode lama tidak berlaku lagi
    } catch (err) {
      setError(err instanceof ApiError ? err.message : pesanError(0));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="display">
          Lupa <span className="hl">password</span>
        </h1>
        <p className="text-text-muted">Pakai kode pemulihan yang kamu simpan saat mendaftar.</p>
      </div>
      {kode ? (
        <KodePemulihan
          kode={kode}
          labelLanjut="Lanjut"
          onLanjut={async () => {
            // Halaman dipertahankan Next (Activity): hapus kode & isian agar tidak tampil lagi.
            setKode(null);
            setRecoveryCode("");
            setNewPassword("");
            await refresh();
            router.push("/riwayat");
          }}
        />
      ) : (
        <>
          <form className="card flex flex-col gap-4" onSubmit={reset}>
            <Kolom label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Kolom label="Kode pemulihan" autoComplete="off" spellCheck={false} value={recoveryCode} onChange={(e) => setRecoveryCode(e.target.value)} />
            <Kolom
              label="Password baru"
              type="password"
              autoComplete="new-password"
              minLength={8}
              hint="Minimal 8 karakter. Setelah berhasil, kamu mendapat kode pemulihan baru."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <FormError message={error} />
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? "Memeriksa…" : "Atur ulang password"}
            </button>
          </form>
          <Link href="/masuk" className="min-h-11 self-start py-2 text-[15px] font-bold text-primary-text underline underline-offset-2">
            Kembali ke Masuk
          </Link>
        </>
      )}
    </div>
  );
}
