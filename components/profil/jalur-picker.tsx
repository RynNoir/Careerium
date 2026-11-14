import { ArrowRight, Sparkles } from "lucide-react";
import { PrioritasBadge } from "@/components/ui";
import { EKSPLORASI, namaPendek, sumberJalur } from "@/lib/pesan-template";
import type { JalurKarier } from "@/lib/schemas";

/**
 * Mode eksplorasi: 2–3 jalur teratas. Skor & urutan dihitung kode (tanpa penilai AI); `ringkasan` (usulan mentor)
 * dan `alasan_ai` ditulis AI dan bersifat opsional: bila kosong, tampil alasan template dari server.
 */
export function JalurPicker({
  jalur,
  ringkasan,
  onPilih,
}: {
  jalur: JalurKarier[];
  ringkasan?: string | null;
  onPilih: (j: JalurKarier) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="display">
          Jalur yang <span className="hl">cocok</span> untukmu
        </h1>
        <p className="max-w-[65ch] text-text-muted">{EKSPLORASI.isi}</p>
      </div>
      {ringkasan && (
        <section className="card flex flex-col gap-2" aria-labelledby="judul-usulan">
          <h2 id="judul-usulan" className="flex items-center gap-2 text-[17px]">
            <Sparkles className="size-5 shrink-0 text-primary-text" aria-hidden="true" />
            {EKSPLORASI.judulUsulan}
            <span className="badge bg-accent">{EKSPLORASI.ditulisAi}</span>
          </h2>
          <p className="rounded-btn border-2 border-ink bg-accent-soft p-3">{ringkasan}</p>
        </section>
      )}
      <p className="text-[13px] text-text-muted">{EKSPLORASI.catatanSkor}</p>
      <ol className="grid gap-4 lg:grid-cols-3">
        {jalur.slice(0, 3).map((j, i) => (
          <li key={j.posisi_preset} className="card flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="label-caps">Pilihan {i + 1}</span>
                <h2 className="text-[19px] leading-tight">{j.posisi}</h2>
              </div>
              <span
                className="grid size-14 shrink-0 place-items-center rounded-btn border-2 border-ink bg-primary font-display text-[22px] font-extrabold tabular-nums"
                aria-label={`Skor kecocokan ${j.skor} dari 100`}
              >
                {j.skor}
              </span>
            </div>
            <p className="text-[15px]">{j.alasan_ai ?? j.alasan}</p>
            <p className="text-[13px] text-text-muted">
              Kebutuhan wajib terpenuhi: {j.wajib_terpenuhi} dari {j.wajib_total}
            </p>
            {j.kekuatan.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="label-caps">Kekuatanmu</p>
                <ul className="flex flex-wrap gap-1.5">
                  {j.kekuatan.map((k) => (
                    <li key={k} className="chip min-h-0 py-1 text-[13px]">
                      {k}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {j.gap_teratas.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="label-caps">Perlu ditingkatkan</p>
                <ul className="flex flex-col gap-1.5">
                  {j.gap_teratas.map((g) => (
                    <li key={g.nama} className="flex items-center justify-between gap-2 text-[14px]">
                      <span className="min-w-0 font-semibold wrap-break-word">{namaPendek(g.nama)}</span>
                      <PrioritasBadge prioritas={g.prioritas} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-[12px] text-text-muted">{sumberJalur(j.sumberLowongan.jumlah, j.sumberLowongan.diakses)}</p>
            <button type="button" className="btn btn-secondary mt-auto w-full" onClick={() => onPilih(j)}>
              Pilih {j.posisi} <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
