"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import { useFlow } from "@/components/flow-provider";
import { RadarCard } from "@/components/hasil/radar-card";
import { RoadmapList } from "@/components/hasil/roadmap-list";
import { ScoreTile } from "@/components/hasil/score-tile";
import { EksporPdf } from "@/components/hasil/ekspor-pdf";
import { SimpanHasil } from "@/components/hasil/simpan-hasil";
import { EmptyState, ErrorCard, Kira, KiraBubble, PrioritasBadge, StageLoading, Steps } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";
import {
  LABEL_TINGKAT,
  ROADMAP_GAGAL,
  TAHAP_LOADING,
  kiraHasil,
  pesanError,
  sumberGap,
} from "@/lib/pesan-template";
import type { GapResult } from "@/lib/schemas";

export function HasilView() {
  const { state, update } = useFlow();
  const { gap, roadmap, intent } = state;
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  function toggle(key: string, v: boolean) {
    update((s) => ({ roadmapDone: { ...s.roadmapDone, [key]: v } }));
    const itemId = state.roadmapItemIds[key];
    if (!state.savedId || !itemId) return;
    setSyncError(null);
    api.setRoadmapItem(state.savedId, itemId, v).catch((e) => {
      update((s) => ({ roadmapDone: { ...s.roadmapDone, [key]: !v } }));
      setSyncError(e instanceof ApiError ? e.message : pesanError(0));
    });
  }

  if (!gap || !intent?.tahap || !intent.posisi_target) {
    return (
      <div className="flex flex-col gap-5">
        <Steps aktif={3} />
        <EmptyState
          judul="Belum ada hasil"
          action={
            <Link href="/mulai" className="btn btn-primary w-full sm:w-auto">
              Mulai analisis
            </Link>
          }
        >
          Ceritakan tujuanmu dan tempel CV, lalu hasilnya muncul di sini.
        </EmptyState>
      </div>
    );
  }
  const { tahap, posisi_target: posisi, tujuan } = intent;

  async function susunRoadmap(g: GapResult) {
    setRoadmapError(null);
    setRoadmapLoading(true);
    try {
      update({ roadmap: await api.roadmap({ gap: g, tahap, posisi, tujuan, demo: state.demo || undefined }), roadmapDone: {}, roadmapItemIds: {} });
    } catch (e) {
      setRoadmapError(e instanceof ApiError ? e.message : pesanError(0));
    } finally {
      setRoadmapLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-20 lg:pb-0">
      <Steps aktif={3} />
      <div className="flex flex-col gap-1">
        <h1 className="display">
          Hasil untuk <span className="hl">{posisi}</span>
        </h1>
        <p className="text-text-muted">Peta skill dari CV-mu dibandingkan dengan kebutuhan posisi.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start print:hidden">
        <SimpanHasil />
        <EksporPdf posisi={posisi} />
      </div>

      {/* Ponsel: skor → perlu ditingkatkan → radar → kekuatan. Desktop: bento 3 kolom. */}
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
        <div className="order-1 flex items-start gap-3 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:flex-col lg:gap-4">
          <div className="min-w-0 flex-1 lg:w-full">
            <ScoreTile gap={gap} />
          </div>
          <div className="flex w-[42%] max-w-45 flex-col items-center gap-2 lg:w-full lg:max-w-none lg:rounded-card lg:border-2 lg:border-ink lg:bg-surface lg:p-4 lg:shadow-(--shadow-card)">
            <KiraBubble>{kiraHasil(gap)}</KiraBubble>
            <Kira pose="menunjuk" size={72} className="lg:w-24" />
          </div>
        </div>

        <div className="order-3 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <RadarCard radar={gap.radar} />
        </div>

        <div className="order-2 lg:col-start-3 lg:row-start-1">
          <GapList gap={gap} />
        </div>

        <div className="order-4 lg:col-start-3 lg:row-start-2">
          <KekuatanList gap={gap} />
        </div>
      </div>

      {/* Bar CTA: desktop bar emas; ponsel tombol menempel di atas navigasi bawah. */}
      <div className="lg:flex lg:items-center lg:justify-between lg:gap-4 lg:rounded-xl lg:border-2 lg:border-ink lg:bg-accent lg:p-3 lg:pl-4 lg:shadow-(--shadow-card) print:hidden">
        <p className="hidden font-semibold lg:block">
          {roadmap ? `Roadmap 4 minggu siap. Minggu 1: ${roadmap.minggu[0].fokus}` : "Latih jawabanmu untuk gap di atas."}
        </p>
        <div className="fixed inset-x-4 bottom-21 z-10 lg:static">
          <Link href="/wawancara" className="btn btn-primary w-full lg:w-auto">
            Mulai latihan wawancara <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="judul-roadmap">
        <h2 id="judul-roadmap" className="text-[20px]">
          Roadmap belajar 4 minggu
        </h2>
        {state.roadmapAdaptif && (
          <div className="flex flex-col gap-1 rounded-btn border-2 border-ink bg-accent-soft p-3">
            <p className="font-semibold">{state.roadmapAdaptif.catatan}</p>
            {state.savedId && state.roadmapAdaptif.diperbarui && Object.keys(state.roadmapItemIds).length === 0 && (
              <p className="text-[13px] text-text-muted">Roadmap baru ini belum tersimpan, jadi centangnya hanya tercatat di browser ini.</p>
            )}
          </div>
        )}
        {syncError && <ErrorCard message={syncError} />}
        {roadmap ? (
          <RoadmapList
            roadmap={roadmap}
            done={state.roadmapDone}
            onToggle={toggle}
            sorot={state.roadmapAdaptif?.diperbarui && state.roadmapAdaptif.fokus_ulang.length ? [1, 2] : []}
          />
        ) : roadmapLoading ? (
          <StageLoading tahap={TAHAP_LOADING.roadmap} />
        ) : (
          <ErrorCard
            message={roadmapError ?? ROADMAP_GAGAL}
            action={
              <button type="button" className="btn btn-secondary w-full sm:w-auto sm:self-start" onClick={() => susunRoadmap(gap)}>
                <RotateCcw className="size-4" aria-hidden="true" /> Susun ulang roadmap
              </button>
            }
          />
        )}
      </section>
    </div>
  );
}

const RINGKAS = 5;
const tersembunyi = (i: number, open: boolean) => !open && i >= RINGKAS;

/** Tombol buka/tutup daftar panjang (gap & kekuatan bisa >10 item). */
function LihatSemua({ total, open, onToggle, label }: { total: number; open: boolean; onToggle: () => void; label: string }) {
  if (total <= RINGKAS) return null;
  return (
    <button type="button" className="min-h-11 self-start font-bold text-primary-text print:hidden" aria-expanded={open} onClick={onToggle}>
      {open ? "Tampilkan lebih sedikit" : `Lihat semua ${total} ${label}`}
    </button>
  );
}

function GapList({ gap }: { gap: GapResult }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="card flex flex-col gap-1" aria-labelledby="judul-gap">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="judul-gap" className="text-[17px]">
          Perlu ditingkatkan
        </h2>
        <span className="text-[12px] text-text-muted">{gap.gap.length} skill</span>
      </div>
      {gap.gap.length === 0 ? (
        <p className="py-2 text-text-muted">Tidak ada gap utama. Kebutuhan posisi ini sudah terpenuhi.</p>
      ) : (
        <ul className="flex flex-col">
          {gap.gap.map((g, i) => (
            <li
              key={g.nama}
              className={`items-start gap-3 border-t-[1.5px] border-ink py-2.5 first:border-t-0 ${tersembunyi(i, open) ? "hidden print:flex" : "flex"}`}
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-semibold wrap-break-word">{g.nama}</span>
                <span className="text-[13px] text-text-muted">{sumberGap(g.jumlah_muncul, gap.sumberLowongan)}</span>
              </div>
              <PrioritasBadge prioritas={g.prioritas} />
            </li>
          ))}
        </ul>
      )}
      <LihatSemua total={gap.gap.length} open={open} onToggle={() => setOpen(!open)} label="skill" />
    </section>
  );
}

function KekuatanList({ gap }: { gap: GapResult }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="card flex flex-col gap-1" aria-labelledby="judul-kekuatan">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="judul-kekuatan" className="text-[17px]">
          Kekuatan
        </h2>
        <span className="text-[12px] text-text-muted">{gap.kekuatan.length} skill</span>
      </div>
      {gap.kekuatan.length === 0 ? (
        <p className="py-2 text-text-muted">Belum ada skill yang cocok dengan kebutuhan posisi. Roadmap di bawah membantumu memulai.</p>
      ) : (
        <ul className="flex flex-col">
          {gap.kekuatan.map((k, i) => (
            <li key={k.nama} className={`border-t-[1.5px] border-ink py-2.5 first:border-t-0 ${tersembunyi(i, open) ? "hidden print:block" : ""}`}>
              <details className="group">
                <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
                  <Check className="size-5 shrink-0 text-success" strokeWidth={3} aria-hidden="true" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-semibold wrap-break-word">{k.nama}</span>
                    <span className="text-[13px] text-text-muted">Tingkat: {LABEL_TINGKAT[k.tingkat]}</span>
                  </span>
                  <span className="text-[13px] font-bold whitespace-nowrap text-primary-text print:hidden">
                    Bukti di CV <span className="inline-block transition-transform group-open:rotate-90">›</span>
                  </span>
                </summary>
                <blockquote className="mt-2 ml-8 rounded-[8px] bg-surface-muted px-3 py-2 text-[14px]">&ldquo;{k.bukti}&rdquo;</blockquote>
              </details>
              {/* <details> tertutup tidak tercetak: bukti ditulis ulang khusus untuk PDF */}
              <p className="hidden pl-8 text-[13px] print:block">Bukti di CV: &ldquo;{k.bukti}&rdquo;</p>
            </li>
          ))}
        </ul>
      )}
      <LihatSemua total={gap.kekuatan.length} open={open} onToggle={() => setOpen(!open)} label="kekuatan" />
    </section>
  );
}
