// Komponen dasar Stiker Biru (DESIGN.md §6). Gaya ada di app/globals.css (.btn, .card, .chip, .badge, .skeleton).
import Image from "next/image";
import { CircleAlert } from "lucide-react";
import type { GapItem } from "@/lib/schemas";

export type PoseKira = "menunjuk" | "menyapa" | "berpikir" | "merayakan" | "menyemangati";

/** Maskot dekoratif: selalu alt="" — kalimat penting tetap ada sebagai teks. */
export function Kira({ pose, size = 72, className }: { pose: PoseKira; size?: number; className?: string }) {
  return (
    <Image
      src={`/mascot/kira-${pose}.svg`}
      alt=""
      aria-hidden="true"
      width={size}
      height={Math.round((size * 170) / 160)}
      unoptimized
      className={className}
    />
  );
}

/** Gelembung kalimat Kira. Teks wajib dari lib/pesan-template.ts. */
export function KiraBubble({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border-2 border-ink bg-surface px-3 py-2 text-[13px] font-semibold shadow-(--shadow-btn)">
      {children}
    </p>
  );
}

const LANGKAH = ["Tujuan", "Profil", "Hasil"] as const;

/** Penanda 3 langkah alur. `aktif` 1-based. */
export function Steps({ aktif }: { aktif: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-3">
      <span className="badge bg-accent text-[12px]">
        {aktif}/3
      </span>
      <ol className="flex flex-1 gap-1.5 text-[12px] text-text-muted" aria-label={`Langkah ${aktif} dari 3`}>
        {LANGKAH.map((l, i) => {
          const on = i + 1 === aktif;
          return (
            <li key={l} className={`flex flex-1 flex-col gap-1 ${on ? "font-bold text-text" : ""}`} aria-current={on ? "step" : undefined}>
              <span className={`h-1.5 rounded-[5px] border-[1.5px] border-ink ${i + 1 <= aktif ? "bg-primary" : "bg-surface-muted"}`} />
              {l}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Bar progres sederhana (wawancara n/5). */
export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <div className="flex gap-1.5" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`h-1.5 flex-1 rounded-[5px] border-[1.5px] border-ink ${i < value ? "bg-primary" : "bg-surface-muted"}`} />
      ))}
    </div>
  );
}

const PRIORITAS: Record<GapItem["prioritas"], { teks: string; cls: string }> = {
  wajib: { teks: "Wajib", cls: "badge-wajib" },
  penting: { teks: "Penting", cls: "badge-penting" },
  nilai_tambah: { teks: "Nilai tambah", cls: "badge-nilai" },
};

export function PrioritasBadge({ prioritas }: { prioritas: GapItem["prioritas"] }) {
  const p = PRIORITAS[prioritas];
  return <span className={`badge ${p.cls}`}>{p.teks}</span>;
}

/** Error sistem: ikon error + teks navy + saran tindakan. */
export function ErrorCard({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div role="alert" className="card flex flex-col gap-3">
      <p className="flex items-start gap-2 font-semibold">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-error" aria-hidden="true" />
        <span>{message}</span>
      </p>
      {action}
    </div>
  );
}

/** Keadaan kosong / penolakan: Kira + judul + kalimat template + aksi. */
export function EmptyState({
  pose = "menyapa",
  judul,
  children,
  action,
}: {
  pose?: PoseKira;
  judul: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Kira pose={pose} size={64} className="shrink-0" />
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] leading-tight">{judul}</h2>
          {children && <div className="text-text-muted">{children}</div>}
        </div>
      </div>
      {action}
    </div>
  );
}

/** Skeleton + teks tahap + Kira berpikir (DESIGN.md §2.5). */
export function StageLoading({ tahap, lines = 3 }: { tahap: string; lines?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="flex items-center gap-3">
        <Kira pose="berpikir" size={56} />
        <p role="status" className="font-semibold">
          {tahap}
        </p>
      </div>
      <div className="card flex flex-col gap-3">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="skeleton h-4" style={{ width: `${90 - i * 15}%` }} />
        ))}
      </div>
    </div>
  );
}
