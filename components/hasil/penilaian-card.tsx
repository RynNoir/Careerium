"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { PrioritasBadge } from "@/components/ui";
import {
  CATATAN_METODE_AI,
  CATATAN_METODE_ATURAN,
  JUDUL_PENILAIAN,
  LABEL_NILAI,
} from "@/lib/pesan-template";
import type { GapResult } from "@/lib/schemas";

const URUT = { wajib: 0, penting: 1, nilai_tambah: 2 } as const;
const RINGKAS = 6;

/** Empat titik penanda nilai rubrik 0–4 (dekoratif: nilainya juga ditulis sebagai teks). */
function Titik({ nilai }: { nilai: number }) {
  return (
    <span className="flex shrink-0 gap-1" aria-hidden="true">
      {[1, 2, 3, 4].map((n) => (
        <span key={n} className={`size-2.5 rounded-full border-[1.5px] border-ink ${n <= nilai ? "bg-primary" : "bg-surface-muted"}`} />
      ))}
    </span>
  );
}

/**
 * Penilaian AI asesor (GapResult.penilaian / ringkasan_ai / metode_skor). Semua field opsional di kontrak:
 * hasil lama dari riwayat tanpa field ini tidak menampilkan kartu apa pun.
 */
export function PenilaianCard({ gap }: { gap: GapResult }) {
  const [open, setOpen] = useState(false);
  const daftar = [...(gap.penilaian ?? [])].sort((a, b) => URUT[a.prioritas] - URUT[b.prioritas] || b.nilai - a.nilai);
  if (daftar.length === 0 && !gap.ringkasan_ai) return null;
  const ai = gap.metode_skor === "ai_rubrik";

  return (
    <section className="card flex flex-col gap-3" aria-labelledby="judul-penilaian">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="judul-penilaian" className="flex items-center gap-2 text-[17px]">
          <Sparkles className="size-5 shrink-0 text-primary-text" aria-hidden="true" />
          {JUDUL_PENILAIAN}
        </h2>
        {gap.metode_skor && <span className={`badge ${ai ? "bg-accent" : "bg-surface-muted"}`}>{ai ? "Dinilai AI" : "Dinilai otomatis"}</span>}
      </div>

      {gap.ringkasan_ai && <p className="rounded-btn border-2 border-ink bg-accent-soft p-3">{gap.ringkasan_ai}</p>}
      {gap.metode_skor && <p className="text-[13px] text-text-muted">{ai ? CATATAN_METODE_AI : CATATAN_METODE_ATURAN}</p>}

      {daftar.length > 0 && (
        <>
          <ul className="flex flex-col">
            {daftar.map((p, i) => (
              <li
                key={p.nama}
                className={`flex-col gap-1 border-t-[1.5px] border-ink py-2.5 first:border-t-0 ${!open && i >= RINGKAS ? "hidden print:flex" : "flex"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0 flex-1 font-semibold wrap-break-word">{p.nama}</span>
                  <PrioritasBadge prioritas={p.prioritas} />
                </div>
                <div className="flex items-center gap-2 text-[13px] font-semibold">
                  <Titik nilai={p.nilai} />
                  <span>{LABEL_NILAI[p.nilai]}</span>
                </div>
                {p.alasan && <p className="text-[14px]">{p.alasan}</p>}
                {p.bukti && <blockquote className="rounded-[8px] bg-surface-muted px-3 py-2 text-[13px]">&ldquo;{p.bukti}&rdquo;</blockquote>}
              </li>
            ))}
          </ul>
          {daftar.length > RINGKAS && (
            <button type="button" className="min-h-11 self-start font-bold text-primary-text print:hidden" aria-expanded={open} onClick={() => setOpen(!open)}>
              {open ? "Tampilkan lebih sedikit" : `Lihat semua ${daftar.length} kebutuhan`}
            </button>
          )}
        </>
      )}
    </section>
  );
}
