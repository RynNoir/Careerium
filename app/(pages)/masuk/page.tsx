"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { FormError, Kolom } from "@/components/akun/form-ui";
import { useFlow } from "@/components/flow-provider";
import { api, ApiError } from "@/lib/api-client";
import { pesanError } from "@/lib/pesan-template";

export default function MasukPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const { state } = useFlow();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function masuk(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.login({ email: email.trim(), password });
      await refresh();
      setPassword(""); // halaman dipertahankan Next (Activity): jangan sisakan password di DOM
      setLoading(false);
      router.push(state.gap ? "/hasil" : "/riwayat");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : pesanError(0));
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="display">
          <span className="hl">Masuk</span> ke akunmu
        </h1>
        <p className="text-text-muted">Simpan hasil analisis dan pantau progres latihanmu. Tanpa akun pun tetap bisa dipakai.</p>
      </div>
      <form className="card flex flex-col gap-4" onSubmit={masuk}>
        <Kolom label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Kolom label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <FormError message={error} />
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Memeriksa…" : "Masuk"}
        </button>
        <Link href="/lupa-password" className="min-h-11 self-start py-2 text-[14px] font-bold text-primary-text underline underline-offset-2">
          Lupa password?
        </Link>
      </form>
      <p className="text-[15px]">
        Belum punya akun?{" "}
        <Link href="/daftar" className="inline-flex min-h-11 items-center font-bold text-primary-text underline underline-offset-2">
          Daftar
        </Link>
      </p>
    </div>
  );
}
