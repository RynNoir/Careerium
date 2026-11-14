"use client";

import { useId, useState } from "react";
import { Check, Copy, ShieldAlert } from "lucide-react";
import { AKUN } from "@/lib/pesan-template";

export function Kolom({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      <input id={id} className="field" aria-describedby={hint ? `${id}-hint` : undefined} required {...props} />
      {hint && (
        <p id={`${id}-hint`} className="text-[13px] text-text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Kode pemulihan: tampil sekali, tombol salin, wajib dikonfirmasi sebelum lanjut. */
export function KodePemulihan({ kode, onLanjut, labelLanjut }: { kode: string; onLanjut: () => void; labelLanjut: string }) {
  const [disalin, setDisalin] = useState(false);
  const [paham, setPaham] = useState(false);
  const id = useId();

  async function salin() {
    try {
      await navigator.clipboard.writeText(kode);
      setDisalin(true);
    } catch {
      setDisalin(false); // clipboard ditolak: pengguna tetap bisa memilih teks secara manual
    }
  }

  return (
    <section className="card flex flex-col gap-3 bg-accent-soft" aria-labelledby={`${id}-judul`}>
      <h2 id={`${id}-judul`} className="flex items-center gap-2 text-[18px]">
        <ShieldAlert className="size-5 shrink-0" aria-hidden="true" /> {AKUN.kodePemulihanJudul}
      </h2>
      <p className="text-[15px]">{AKUN.kodePemulihanIsi}</p>
      <p className="rounded-btn border-2 border-ink bg-surface px-3 py-2 text-center font-mono text-[18px] font-bold tracking-wider break-all select-all">
        {kode}
      </p>
      <button type="button" className="btn btn-secondary w-full sm:w-auto sm:self-start" onClick={salin}>
        {disalin ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
        {disalin ? "Tersalin" : "Salin kode"}
      </button>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] font-semibold">
        <input type="checkbox" className="size-5 accent-(--primary)" checked={paham} onChange={(e) => setPaham(e.target.checked)} />
        Aku sudah menyimpan kode ini
      </label>
      <button type="button" className="btn btn-primary w-full sm:w-auto sm:self-start" disabled={!paham} onClick={onLanjut}>
        {labelLanjut}
      </button>
    </section>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-[14px] font-semibold text-error">
      {message}
    </p>
  );
}
