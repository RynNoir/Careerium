"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, ShieldCheck, Upload } from "lucide-react";
import { AiErrorAksi } from "@/components/ai-error-aksi";
import { RESET_ANALISIS, useFlow } from "@/components/flow-provider";
import { JalurPicker } from "@/components/profil/jalur-picker";
import { EmptyState, ErrorCard, StageLoading, Steps } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";
import { CV_DEMO_RANI } from "@/lib/demo-data";
import { MAX_CV_CHARS } from "@/lib/limits";
import { CV_TIDAK_VALID, EKSPLORASI, PDF_GAGAL, PRIVASI_CV, TAHAP_LOADING, pesanError } from "@/lib/pesan-template";
import { redact } from "@/lib/redact";
import type { JalurKarier, PosisiPreset, Profile } from "@/lib/schemas";

type Tab = "tempel" | "pdf";
type Stage = keyof typeof TAHAP_LOADING;

export function ProfilView() {
  const { state, update } = useFlow();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("tempel");
  // Teks CV hanya di state komponen ini, tidak pernah ke sessionStorage.
  const [cv, setCv] = useState("");
  const [stage, setStage] = useState<Stage | "eksplorasi" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorObj, setErrorObj] = useState<unknown>(null); // ApiError asli: kode & waktu tunggu untuk arahan "Coba lagi"
  const [pdfInfo, setPdfInfo] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const intent = state.intent;
  if (!intent || !state.confirmed || !intent.tahap) {
    return (
      <div className="flex flex-col gap-5">
        <Steps aktif={2} />
        <EmptyState
          judul="Ceritakan tujuanmu dulu"
          action={
            <Link href="/mulai" className="btn btn-primary w-full sm:w-auto">
              Mulai dari tujuan
            </Link>
          }
        >
          Kira perlu tahu tujuan dan tahapmu sebelum membaca CV.
        </EmptyState>
      </div>
    );
  }
  const { tahap, posisi_target, posisi_preset, tujuan } = intent;
  const posisi = posisi_target?.trim() ?? "";
  // Mode eksplorasi: tujuan "eksplorasi" atau belum ada posisi → usulkan jalur setelah profil terbaca.
  const modeEksplorasi = tujuan === "eksplorasi" || !posisi;
  const demo = state.demo || undefined;

  async function bacaPdf(file: File) {
    setError(null);
    setPdfInfo("Membaca PDF…");
    try {
      const { pdfToText } = await import("@/lib/pdf");
      const text = (await pdfToText(file)).slice(0, MAX_CV_CHARS);
      if (text.trim().length < 30) throw new Error("kosong");
      setCv(text);
      setPdfInfo(null);
      setTab("tempel"); // tampilkan hasilnya agar bisa diperiksa sebelum dikirim
    } catch {
      setPdfInfo(null);
      setError(PDF_GAGAL);
    }
  }

  const gagal = (e: unknown) => {
    setErrorObj(e);
    setStage(null);
    setError(e instanceof ApiError ? e.message : pesanError(0));
  };

  /** profil → gap → roadmap → layar Hasil. */
  async function lanjutGap(profile: Profile, pos: string, preset: PosisiPreset | null) {
    setStage("gap");
    const gap = await api.gap({
      profile,
      posisi: pos,
      posisi_preset: preset,
      tahap,
      tujuan, // standar penilaian AI asesor: magang vs kerja
      jobDescription: preset ? undefined : state.jobDescription.trim() || undefined,
      demo,
    });
    update({ ...RESET_ANALISIS, profile, gap, jalur: null, ringkasanJalur: null });
    setStage("roadmap");
    try {
      update({ roadmap: await api.roadmap({ gap, tahap, posisi: pos, tujuan, demo }) });
    } catch {
      // Hasil tetap tampil; layar Hasil menyediakan tombol susun ulang roadmap.
    }
    router.push("/hasil");
  }

  async function analisis() {
    setError(null);
    setErrorObj(null);
    try {
      setStage("profil");
      const profile = await api.profile({ cvText: redact(cv).slice(0, MAX_CV_CHARS), demo });
      if (!profile.cv_valid) {
        setStage(null);
        setError(CV_TIDAK_VALID);
        return;
      }
      if (modeEksplorasi) {
        setStage("eksplorasi");
        const { jalur, ringkasan_ai } = await api.eksplorasi({ profile, tahap, demo });
        update({ ...RESET_ANALISIS, profile, gap: null, jalur, ringkasanJalur: ringkasan_ai ?? null });
        setStage(null);
        return;
      }
      await lanjutGap(profile, posisi, posisi_preset);
    } catch (e) {
      gagal(e);
    }
  }

  async function pilihJalur(j: JalurKarier) {
    if (!state.profile) return;
    setError(null);
    update((s) => ({ intent: s.intent && { ...s.intent, posisi_target: j.posisi, posisi_preset: j.posisi_preset } }));
    try {
      await lanjutGap(state.profile, j.posisi, j.posisi_preset);
    } catch (e) {
      gagal(e);
    }
  }

  if (stage) {
    if (stage === "eksplorasi")
      return (
        <div className="flex flex-col gap-5">
          <Steps aktif={2} />
          <StageLoading tahap={EKSPLORASI.tahap} lines={4} />
        </div>
      );
    return (
      <div className="flex flex-col gap-5">
        <Steps aktif={2} />
        <StageLoading tahap={TAHAP_LOADING[stage]} lines={4} />
        <ol className="flex flex-col gap-1 text-[14px]" aria-label="Tahap analisis">
          {(Object.keys(TAHAP_LOADING) as Stage[]).map((s) => {
            const urut = Object.keys(TAHAP_LOADING).indexOf(s) - Object.keys(TAHAP_LOADING).indexOf(stage);
            return (
              <li key={s} className={urut === 0 ? "font-bold" : "text-text-muted"}>
                {urut < 0 ? "✓ " : urut === 0 ? "→ " : "· "}
                {TAHAP_LOADING[s]}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  // Usulan jalur menunggu dipilih (bertahan saat muat ulang).
  if (state.jalur && state.profile && !state.gap) {
    return (
      <div className="flex flex-col gap-5">
        <Steps aktif={2} />
        <JalurPicker jalur={state.jalur} ringkasan={state.ringkasanJalur} onPilih={pilihJalur} />
        {error && <ErrorCard message={error} />}
        <button
          type="button"
          className="min-h-11 self-start font-bold text-primary-text underline underline-offset-2"
          onClick={() => update({ jalur: null, profile: null })}
        >
          Ganti CV
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Steps aktif={2} />
      <div className="flex flex-col gap-2">
        <h1 className="display">
          Tunjukkan <span className="hl">CV</span>-mu
        </h1>
        <p className="max-w-[65ch] text-text-muted">
          {modeEksplorasi ? (
            <>Kira akan mencari skill beserta buktinya di CV-mu, lalu mengusulkan jalur karier yang paling cocok.</>
          ) : (
            <>
              Target: <strong className="text-text">{posisi}</strong>. Kira akan mencari skill beserta buktinya di CV-mu.
            </>
          )}
        </p>
      </div>


      <div className="card flex flex-col gap-4">
        <div role="tablist" aria-label="Cara memasukkan CV" className="grid grid-cols-2 gap-2">
          {(
            [
              ["tempel", "Tempel teks", FileText],
              ["pdf", "Unggah PDF", Upload],
            ] as const
          ).map(([t, label, Icon]) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={`${id}-tab-${t}`}
              aria-selected={tab === t}
              aria-controls={`${id}-panel-${t}`}
              onClick={() => setTab(t)}
              className={`chip min-h-11 justify-center ${tab === t ? "bg-primary-soft" : "bg-surface"}`}
            >
              <Icon className="size-4" aria-hidden="true" /> {label}
            </button>
          ))}
        </div>

        {tab === "tempel" ? (
          <div role="tabpanel" id={`${id}-panel-tempel`} aria-labelledby={`${id}-tab-tempel`} className="flex flex-col gap-2">
            <label htmlFor={`${id}-cv`} className="font-semibold">
              Isi CV
            </label>
            <textarea
              id={`${id}-cv`}
              className="field min-h-[220px] resize-y font-[inherit] text-[15px]"
              value={cv}
              maxLength={MAX_CV_CHARS}
              onChange={(e) => setCv(e.target.value)}
              placeholder="Tempel isi CV-mu di sini: pendidikan, pengalaman, proyek, skill…"
              aria-describedby={`${id}-cv-count`}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              {state.demo ? (
                <button type="button" className="min-h-11 font-bold text-primary-text underline underline-offset-2" onClick={() => setCv(CV_DEMO_RANI)}>
                  Isi CV contoh Rani
                </button>
              ) : (
                <span />
              )}
              <p id={`${id}-cv-count`} className="text-[13px] text-text-muted tabular-nums">
                {cv.length}/{MAX_CV_CHARS}
              </p>
            </div>
          </div>
        ) : (
          <div role="tabpanel" id={`${id}-panel-pdf`} aria-labelledby={`${id}-tab-pdf`} className="flex flex-col gap-3">
            <label htmlFor={`${id}-file`} className="font-semibold">
              Pilih file PDF CV (teks, bukan hasil pindaian)
            </label>
            <input
              ref={fileRef}
              id={`${id}-file`}
              type="file"
              accept="application/pdf"
              className="field text-[15px]"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void bacaPdf(f);
              }}
            />
            {pdfInfo && (
              <p role="status" className="text-[14px] font-semibold">
                {pdfInfo}
              </p>
            )}
          </div>
        )}

        <p className="flex items-start gap-2 text-[13px] text-text-muted">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
          {PRIVASI_CV}
        </p>
      </div>

      {error && <ErrorCard message={error} action={<AiErrorAksi error={errorObj} onRetry={analisis} />} />}

      <button type="button" className="btn btn-primary w-full sm:w-auto sm:self-start" disabled={cv.trim().length < 30} onClick={analisis}>
        Analisis CV-ku <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
