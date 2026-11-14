"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, RotateCcw, Send, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useFlow, type JawabanWawancara } from "@/components/flow-provider";
import { EmptyState, ErrorCard, Kira, KiraBubble, ProgressBar, StageLoading } from "@/components/ui";
import { FeedbackCard } from "@/components/wawancara/feedback-card";
import { api, ApiError } from "@/lib/api-client";
import { demoRani } from "@/lib/demo-data";
import { MAX_ANSWER_CHARS } from "@/lib/limits";
import {
  DEMO_JAWABAN_GAGAL,
  TAHAP_ADAPTIF,
  TAHAP_MENILAI,
  TAHAP_PERTANYAAN,
  namaPendek,
  pesanError,
  ringkasanWawancara,
} from "@/lib/pesan-template";
import type { Question } from "@/lib/schemas";

const JUMLAH = 5;
const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : pesanError(0));

export function WawancaraView() {
  const { state, update } = useFlow();
  const { gap, intent, questions } = state;
  const [errorQ, setErrorQ] = useState<string | null>(null);
  const started = useRef(false);

  const posisi = intent?.posisi_target;
  useEffect(() => {
    if (!gap || !posisi || questions || errorQ || started.current) return;
    started.current = true;
    api
      .questions({ gap, posisi, demo: state.demo || undefined })
      .then((r) => update({ questions: r.questions, answers: {}, wawancaraIdx: 0, attemptSaved: false }))
      .catch((e) => {
        started.current = false;
        setErrorQ(errMsg(e));
      });
  }, [gap, posisi, questions, errorQ, state.demo, update]);

  if (!gap || !posisi) {
    return (
      <EmptyState
        judul="Belum ada bahan latihan"
        action={
          <Link href="/mulai" className="btn btn-primary w-full sm:w-auto">
            Mulai analisis
          </Link>
        }
      >
        Pertanyaan wawancara dibuat dari gap skill kamu. Selesaikan analisis CV dulu, ya.
      </EmptyState>
    );
  }

  if (!questions) {
    return errorQ ? (
      <ErrorCard
        message={errorQ}
        action={
          <button type="button" className="btn btn-secondary w-full sm:w-auto sm:self-start" onClick={() => setErrorQ(null)}>
            <RotateCcw className="size-4" aria-hidden="true" /> Coba lagi
          </button>
        }
      />
    ) : (
      <StageLoading tahap={TAHAP_PERTANYAAN} lines={4} />
    );
  }

  const idx = state.wawancaraIdx;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="display">
          Latihan <span className="hl">wawancara</span>
        </h1>
        <p className="text-[14px] font-semibold">
          {idx < JUMLAH ? `Pertanyaan ${idx + 1} dari ${JUMLAH}` : "Sesi selesai"}
        </p>
        <ProgressBar value={Math.min(idx + 1, JUMLAH)} max={JUMLAH} label={`Pertanyaan ${Math.min(idx + 1, JUMLAH)} dari ${JUMLAH}`} />
      </div>
      {idx < JUMLAH ? (
        <PertanyaanView key={idx} idx={idx} q={questions[idx]} />
      ) : (
        <Ringkasan questions={questions} />
      )}
    </div>
  );
}

function PertanyaanView({ idx, q }: { idx: number; q: Question }) {
  const { state, update } = useFlow();
  const jawab = state.answers[idx];
  const [editing, setEditing] = useState(!jawab);
  const [draft, setDraft] = useState(jawab?.jawaban ?? "");
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  // Contoh jawaban Rani hanya cocok bila pertanyaannya persis pertanyaan demo (data cadangan).
  const contoh = state.demo ? demoRani.contohJawaban.find((c) => c.pertanyaan.trim() === q.pertanyaan.trim()) : undefined;

  async function kirim() {
    setError(null);
    setGrading(true);
    try {
      const grade = await api.grade({ question: q, answer: draft.trim(), demo: state.demo || undefined });
      const sebelumnya = jawab?.grade.status === "dinilai" ? jawab.grade.skor_total : undefined;
      const baru: JawabanWawancara = { jawaban: draft.trim(), grade, sebelumnya };
      update((s) => ({ answers: { ...s.answers, [idx]: baru }, attemptSaved: false }));
      setEditing(false);
    } catch (e) {
      const demoGagal = contoh && draft.trim() !== contoh.jawaban.trim() && e instanceof ApiError && e.status === 503;
      setError(demoGagal ? DEMO_JAWABAN_GAGAL : errMsg(e));
    } finally {
      setGrading(false);
    }
  }

  return (
    <div className={`animate-masuk flex flex-col gap-4 ${editing && !grading ? "pb-72 lg:pb-0" : ""}`}>
      {/* Gelembung AI */}
      <div className="flex items-start gap-2">
        <Kira pose="menyapa" size={32} className="mt-1 shrink-0" />
        <div className="flex max-w-[90%] flex-col gap-2 rounded-card rounded-tl-sm border-2 border-ink bg-surface p-3 shadow-(--shadow-btn)">
          <div className="flex flex-wrap gap-1.5">
            <span className="badge bg-lilac" title={q.gap_asal}>
              Gap: {namaPendek(q.gap_asal)}
            </span>
            <span className="badge bg-surface-muted">{q.jenis === "teknis" ? "Teknis" : "Perilaku"}</span>
          </div>
          <p className="text-[16px] font-semibold wrap-anywhere">{q.pertanyaan}</p>
        </div>
      </div>

      {/* Gelembung pengguna */}
      {jawab && !editing && (
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-card rounded-tr-sm border-2 border-ink bg-primary-soft p-3 text-[15px] whitespace-pre-wrap wrap-anywhere">
            {jawab.jawaban}
          </p>
        </div>
      )}

      {grading && <StageLoading tahap={TAHAP_MENILAI} lines={2} />}

      {jawab && !editing && !grading && (
        <>
          <FeedbackCard grade={jawab.grade} sebelumnya={jawab.sebelumnya} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="btn btn-primary w-full sm:w-auto"
              onClick={() => update({ wawancaraIdx: idx + 1 })}
            >
              {idx + 1 < JUMLAH ? "Pertanyaan berikutnya" : "Lihat ringkasan"} <ArrowRight className="size-4" aria-hidden="true" />
            </button>
            <button type="button" className="btn btn-secondary w-full sm:w-auto" onClick={() => setEditing(true)}>
              <RotateCcw className="size-4" aria-hidden="true" /> Coba jawab ulang
            </button>
          </div>
        </>
      )}

      {error && <ErrorCard message={error} />}

      {/* Input menempel di bawah (ponsel), di atas navigasi bawah */}
      {editing && !grading && (
        <form
          className="fixed inset-x-4 bottom-21 z-10 flex flex-col gap-2 rounded-card border-2 border-ink bg-surface p-3 shadow-(--shadow-card) lg:static lg:p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) void kirim();
          }}
        >
          <label htmlFor={`${id}-jawab`} className="sr-only">
            Jawabanmu
          </label>
          <textarea
            id={`${id}-jawab`}
            className="field min-h-24 resize-y text-[15px] shadow-none"
            rows={3}
            maxLength={MAX_ANSWER_CHARS}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Tulis jawabanmu. Tips: ceritakan situasi, tugas, langkah, dan hasilnya."
            aria-describedby={`${id}-count`}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            {contoh ? (
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-bold text-primary-text underline underline-offset-2"
                onClick={() => setDraft(contoh.jawaban)}
              >
                <Sparkles className="size-4" aria-hidden="true" /> Isi contoh jawaban Rani
              </button>
            ) : (
              <span id={`${id}-count`} className="text-[13px] text-text-muted tabular-nums">
                {draft.length}/{MAX_ANSWER_CHARS}
              </span>
            )}
            <div className="flex items-center gap-2">
              {contoh && (
                <span id={`${id}-count`} className="text-[13px] text-text-muted tabular-nums">
                  {draft.length}/{MAX_ANSWER_CHARS}
                </span>
              )}
              {jawab && (
                <button type="button" className="btn btn-secondary min-h-11 px-3" onClick={() => setEditing(false)}>
                  Batal
                </button>
              )}
              <button type="submit" className="btn btn-primary min-h-11 px-4" disabled={!draft.trim()}>
                Kirim <Send className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

function Ringkasan({ questions }: { questions: Question[] }) {
  const { state, update } = useFlow();
  const { user } = useAuth();
  const { gap, intent, answers, savedId, attemptSaved } = state;
  const [simpan, setSimpan] = useState<{ ke: number; sebelumnya?: number } | null>(null);
  const [simpanError, setSimpanError] = useState<string | null>(null);
  const [adaptif, setAdaptif] = useState<"idle" | "loading" | "done">("idle");
  const [adaptifError, setAdaptifError] = useState<string | null>(null);
  const savingRef = useRef(false);

  const daftar = questions.map((q, i) => ({ q, a: answers[i] })).filter((x): x is { q: Question; a: JawabanWawancara } => !!x.a);
  const dinilai = daftar.filter((x) => x.a.grade.status === "dinilai");
  const rata = daftar.length ? Math.round(daftar.reduce((n, x) => n + x.a.grade.skor_total, 0) / daftar.length) : 0;

  // Login + hasil tersimpan → catat percobaan ini sekali ke riwayat.
  useEffect(() => {
    if (!user || !savedId || attemptSaved || savingRef.current || simpanError || daftar.length === 0) return;
    savingRef.current = true;
    api
      .saveInterview(savedId, {
        detail: daftar.map(({ q, a }) => ({
          pertanyaan: q.pertanyaan,
          gap_asal: q.gap_asal,
          status: a.grade.status,
          skor_total: a.grade.skor_total,
        })),
      })
      .then(async (r) => {
        update({ attemptSaved: true });
        const detail = await api.getAnalysis(savedId).catch(() => null);
        const prev = detail?.interviews.find((x) => x.percobaan_ke === r.percobaan_ke - 1);
        setSimpan({ ke: r.percobaan_ke, sebelumnya: prev?.skor_total });
      })
      .catch((e) => setSimpanError(errMsg(e)))
      .finally(() => {
        savingRef.current = false;
      });
  }, [user, savedId, attemptSaved, simpanError, daftar, update]);

  async function perbaruiRoadmap() {
    if (!gap || !intent?.tahap) return;
    setAdaptifError(null);
    setAdaptif("loading");
    try {
      const r = await api.roadmapAdaptif({
        gap,
        tahap: intent.tahap,
        posisi: intent.posisi_target ?? undefined,
        tujuan: intent.tujuan,
        hasil_wawancara: daftar.map(({ q, a }) => ({
          gap_asal: q.gap_asal,
          status: a.grade.status,
          skor_total: a.grade.skor_total,
          skor: a.grade.skor,
        })),
        roadmap_lama: state.roadmap ?? undefined,
        demo: state.demo || undefined,
      });
      const catatan = { catatan: r.catatan, fokus_ulang: r.fokus_ulang, diperbarui: r.diperbarui };
      // Roadmap baru belum ada di server → centang tidak disinkronkan sampai disimpan ulang.
      update(r.diperbarui ? { roadmap: { minggu: r.minggu }, roadmapDone: {}, roadmapItemIds: {}, roadmapAdaptif: catatan } : { roadmapAdaptif: catatan });
      setAdaptif("done");
    } catch (e) {
      setAdaptif("idle");
      setAdaptifError(errMsg(e));
    }
  }

  return (
    <div className="animate-masuk flex flex-col gap-4">
      <div className="card flex items-center gap-4">
        <Kira pose="merayakan" size={72} className="shrink-0" />
        <div className="flex flex-col gap-1">
          <p className="label-caps">Rata-rata skor</p>
          <p className="font-display text-[48px] leading-[0.9] font-extrabold tabular-nums">
            {rata}
            <span className="text-[18px]">/100</span>
          </p>
          <p className="text-[14px]">{ringkasanWawancara(rata, dinilai.length)}</p>
        </div>
      </div>

      {simpan && (
        <p role="status" className="chip self-start bg-accent-soft">
          Tercatat sebagai percobaan ke-{simpan.ke}
          {simpan.sebelumnya !== undefined && ` (percobaan sebelumnya: ${simpan.sebelumnya})`}
        </p>
      )}
      {simpanError && <ErrorCard message={simpanError} />}
      {!user && <p className="text-[14px] text-text-muted">Masuk lalu simpan hasil di layar Hasil supaya latihanmu tercatat di riwayat.</p>}
      {user && !savedId && <p className="text-[14px] text-text-muted">Tekan &ldquo;Simpan hasil&rdquo; di layar Hasil supaya latihan berikutnya tercatat di riwayat.</p>}

      <section className="card flex flex-col gap-1" aria-labelledby="judul-topik">
        <h2 id="judul-topik" className="text-[17px]">
          Topik yang kamu latih
        </h2>
        <ul className="flex flex-col">
          {daftar.map(({ q, a }, i) => (
            <li key={i} className="flex items-center justify-between gap-3 border-t-[1.5px] border-ink py-2.5 first:border-t-0">
              <span className="min-w-0 font-semibold wrap-break-word">{namaPendek(q.gap_asal)}</span>
              {a.grade.status === "dinilai" ? (
                <span className="font-display text-[20px] font-extrabold tabular-nums">{a.grade.skor_total}</span>
              ) : (
                <span className="badge badge-penting">Tidak dapat dinilai</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {adaptif === "loading" ? (
        <StageLoading tahap={TAHAP_ADAPTIF} lines={2} />
      ) : adaptif === "done" && state.roadmapAdaptif ? (
        <div className="card flex flex-col gap-3">
          <KiraBubble>{state.roadmapAdaptif.catatan}</KiraBubble>
          <Link href="/hasil#judul-roadmap" className="btn btn-primary w-full sm:w-auto sm:self-start">
            Lihat roadmap {state.roadmapAdaptif.diperbarui ? "baru" : ""} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <button type="button" className="btn btn-primary w-full sm:w-auto sm:self-start" onClick={perbaruiRoadmap} disabled={daftar.length === 0}>
          <Sparkles className="size-4" aria-hidden="true" /> Perbarui roadmap dari hasil latihan
        </button>
      )}
      {adaptifError && <ErrorCard message={adaptifError} />}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="btn btn-secondary w-full sm:w-auto"
          onClick={() => update({ answers: {}, wawancaraIdx: 0, attemptSaved: false })}
        >
          <RotateCcw className="size-4" aria-hidden="true" /> Ulangi latihan
        </button>
        <Link href="/hasil" className="btn btn-secondary w-full sm:w-auto">
          Kembali ke hasil
        </Link>
      </div>
    </div>
  );
}
