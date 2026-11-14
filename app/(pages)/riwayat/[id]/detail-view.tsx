"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MessagesSquare } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { RESET_ANALISIS, useFlow } from "@/components/flow-provider";
import { RoadmapList, dariTersimpan } from "@/components/hasil/roadmap-list";
import { SkorChart } from "@/components/riwayat/skor-chart";
import { EmptyState, ErrorCard } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";
import { AKUN, KETERANGAN_SKOR, LABEL_TAHAP, formatWaktu, rincianSkor, namaPendek, pesanError, sumberLowongan } from "@/lib/pesan-template";
import type { AnalysisDetail } from "@/lib/schemas";

export function DetailView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { state, update } = useFlow();
  const [data, setData] = useState<AnalysisDetail | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .getAnalysis(id)
      .then((d) => {
        setData(d);
        setDone(dariTersimpan(d.roadmap).done);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : pesanError(0)));
  }, [user, id]);

  if (user === undefined) return <div className="skeleton h-40" aria-busy="true" />;
  if (!user)
    return (
      <EmptyState
        judul="Masuk untuk melihat riwayat"
        action={
          <Link href="/masuk" className="btn btn-primary w-full sm:w-auto">
            Masuk
          </Link>
        }
      >
        {AKUN.perluMasuk}
      </EmptyState>
    );
  if (error) return <ErrorCard message={error} action={<Link href="/riwayat" className="btn btn-secondary w-full sm:w-auto sm:self-start">Kembali ke riwayat</Link>} />;
  if (!data) return <div className="skeleton h-40" aria-busy="true" />;

  const { roadmap, ids } = dariTersimpan(data.roadmap);

  function toggle(key: string, v: boolean) {
    setDone((d) => ({ ...d, [key]: v }));
    if (!ids[key]) return;
    api.setRoadmapItem(id, ids[key], v).catch((e) => {
      setDone((d) => ({ ...d, [key]: !v }));
      setError(e instanceof ApiError ? e.message : pesanError(0));
    });
  }

  function latihanLagi() {
    if (!data) return;
    update({
      ...RESET_ANALISIS,
      demo: false,
      confirmed: true,
      intent: {
        kategori: "karier_ti",
        tujuan: state.intent?.tujuan && state.intent.tujuan !== "tidak_jelas" ? state.intent.tujuan : "tingkatkan_skill",
        posisi_target: data.target_posisi,
        posisi_preset: null,
        tahap: data.tahap,
        kekhawatiran: null,
        kepercayaan: 1,
      },
      profile: data.profile,
      gap: data.gap,
      roadmap,
      roadmapDone: done,
      roadmapItemIds: ids,
      savedId: data.id,
    });
    router.push("/wawancara");
  }

  const att = data.interviews;
  return (
    <div className="flex flex-col gap-5">
      <Link href="/riwayat" className="inline-flex min-h-11 items-center gap-1.5 self-start font-bold text-primary-text">
        <ArrowLeft className="size-4" aria-hidden="true" /> Semua riwayat
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="display wrap-break-word">{data.target_posisi}</h1>
        <p className="text-text-muted">
          {LABEL_TAHAP[data.tahap]} · {formatWaktu(data.created_at)}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
        <section className="card flex flex-col gap-1 bg-primary" aria-label={`Skor kecocokan ${data.skor} dari 100`}>
          <p className="label-caps text-text">Skor kecocokan</p>
          <p className="font-display text-[56px] leading-[0.9] font-extrabold tabular-nums" aria-hidden="true">
            {data.skor}
            <span className="text-[20px]">/100</span>
          </p>
          {rincianSkor(data.gap.skor_rincian) && <p className="text-[13px] font-semibold">{rincianSkor(data.gap.skor_rincian)}</p>}
          <p className="text-[12px] font-semibold">{KETERANGAN_SKOR}</p>
          <p className="text-[12px]">{sumberLowongan(data.gap.sumberLowongan)}</p>
        </section>

        <section className="card flex flex-col gap-3" aria-labelledby="judul-percobaan">
          <h2 id="judul-percobaan" className="text-[17px]">
            Latihan wawancara
          </h2>
          {att.length === 0 ? (
            <p className="text-text-muted">Belum ada latihan yang tercatat untuk analisis ini.</p>
          ) : (
            <>
              {att.length >= 2 && <SkorChart attempts={att} />}
              <ol className="flex flex-col">
                {att.map((a, i) => {
                  const prev = att[i - 1];
                  const selisih = prev ? a.skor_total - prev.skor_total : null;
                  return (
                    <li key={a.percobaan_ke} className="flex flex-col gap-1 border-t-[1.5px] border-ink py-2.5 first:border-t-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">Percobaan ke-{a.percobaan_ke}</span>
                        <span className="font-display text-[20px] font-extrabold tabular-nums">{a.skor_total}</span>
                      </div>
                      {selisih !== null && (
                        <p className="text-[13px] text-text-muted">
                          {selisih === 0
                            ? `Sama dengan percobaan ke-${prev.percobaan_ke}`
                            : `${selisih > 0 ? "Naik" : "Turun"} ${Math.abs(selisih)} poin dari percobaan ke-${prev.percobaan_ke}`}
                        </p>
                      )}
                      <p className="text-[13px] text-text-muted">{a.detail.map((d) => namaPendek(d.gap_asal)).join(" · ")}</p>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
          <button type="button" className="btn btn-primary w-full sm:w-auto sm:self-start" onClick={latihanLagi}>
            <MessagesSquare className="size-4" aria-hidden="true" /> Latihan wawancara lagi
          </button>
        </section>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="judul-roadmap-riwayat">
        <h2 id="judul-roadmap-riwayat" className="text-[20px]">
          Roadmap belajar
        </h2>
        <RoadmapList roadmap={roadmap} done={done} onToggle={toggle} />
      </section>
    </div>
  );
}
