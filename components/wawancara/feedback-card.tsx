import { Check, Circle, TrendingDown, TrendingUp } from "lucide-react";
import { RUBRIK, STAR, TIDAK_DAPAT_DINILAI } from "@/lib/pesan-template";
import type { Grade } from "@/lib/schemas";

/** Kartu umpan balik satu jawaban (DESIGN.md §6). "Tidak dapat dinilai" memakai gap-soft, bukan merah. */
export function FeedbackCard({ grade, sebelumnya }: { grade: Grade; sebelumnya?: number }) {
  if (grade.status === "tidak_dapat_dinilai") {
    return (
      <section className="card flex flex-col gap-3 bg-gap-soft" aria-label="Umpan balik jawaban">
        <span className="badge self-start bg-surface text-gap">{TIDAK_DAPAT_DINILAI.judul}</span>
        <p>{TIDAK_DAPAT_DINILAI.isi}</p>
        <StarPenjelasan />
      </section>
    );
  }

  const selisih = sebelumnya === undefined ? null : grade.skor_total - sebelumnya;

  return (
    <section className="card flex flex-col gap-4" aria-label="Umpan balik jawaban">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="label-caps">Skor jawaban</p>
          <p className="font-display text-[48px] leading-[0.9] font-extrabold tabular-nums">
            {grade.skor_total}
            <span className="text-[18px]">/100</span>
          </p>
        </div>
        {selisih !== null && (
          <p className="chip bg-primary-soft text-[13px]">
            {selisih >= 0 ? <TrendingUp className="size-4" aria-hidden="true" /> : <TrendingDown className="size-4" aria-hidden="true" />}
            Sebelumnya {sebelumnya} ({selisih >= 0 ? "+" : ""}
            {selisih})
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[16px]">Rubrik</h3>
        <ul className="flex flex-col gap-2">
          {RUBRIK.map((r) => {
            const v = grade.skor[r.kunci];
            return (
              <li key={r.kunci} className="grid grid-cols-[96px_1fr_36px] items-center gap-2 text-[14px]">
                <span>{r.nama}</span>
                <span
                  className="h-3 overflow-hidden rounded-md border-[1.5px] border-ink bg-surface-muted"
                  role="meter"
                  aria-label={`${r.nama} ${v} dari 5`}
                  aria-valuemin={1}
                  aria-valuemax={5}
                  aria-valuenow={v}
                >
                  <span className="block h-full border-r-[1.5px] border-ink bg-primary" style={{ width: `${(v / 5) * 100}%` }} />
                </span>
                <span className="text-right font-semibold tabular-nums">{v}/5</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[16px]">Pola STAR</h3>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {STAR.map((s) => {
            const ada = grade.star[s.kunci];
            return (
              <li key={s.kunci} className="flex items-start gap-2 text-[14px]">
                {ada ? (
                  <Check className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={3} aria-hidden="true" />
                ) : (
                  <Circle className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" />
                )}
                <span>
                  <strong>{s.nama}</strong> <span className="text-text-muted">({s.arti})</span>
                  <span className="sr-only">{ada ? ": sudah ada" : ": belum ada"}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {grade.saran.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[16px]">Saran</h3>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-[15px] wrap-anywhere">
            {grade.saran.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function StarPenjelasan() {
  return (
    <ul className="flex flex-col gap-1 text-[14px]">
      {STAR.map((s) => (
        <li key={s.kunci}>
          <strong>
            {s.huruf} = {s.nama}
          </strong>
          : {s.arti}
        </li>
      ))}
    </ul>
  );
}
