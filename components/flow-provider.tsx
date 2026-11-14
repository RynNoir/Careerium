"use client";

// Store alur (mode tamu): satu context, disimpan ke sessionStorage agar muat ulang tidak menghapus hasil.
// Teks CV mentah TIDAK disimpan di sini (CLAUDE.md §5).
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AdaptiveRoadmap, GapResult, Grade, Intent, JalurKarier, Profile, Question, Roadmap } from "@/lib/schemas";

export type Tahap = NonNullable<Intent["tahap"]>;
export type Tujuan = Intent["tujuan"];

/** `sebelumnya` = skor_total percobaan sebelumnya untuk pertanyaan yang sama (setelah "Coba jawab ulang"). */
export type JawabanWawancara = { jawaban: string; grade: Grade; sebelumnya?: number };
export type CatatanAdaptif = Pick<AdaptiveRoadmap, "catatan" | "fokus_ulang" | "diperbarui">;

export type FlowState = {
  demo: boolean;
  goalText: string;
  intent: Intent | null;
  /** true setelah pengguna menekan "Ya, lanjut" pada kartu konfirmasi */
  confirmed: boolean;
  jobDescription: string;
  profile: Profile | null;
  gap: GapResult | null;
  roadmap: Roadmap | null;
  /** kunci `${minggu}-${index}` (index kegiatan, atau "mp" untuk mini-proyek) */
  roadmapDone: Record<string, boolean>;
  questions: Question[] | null;
  /** jawaban terakhir per indeks pertanyaan */
  answers: Record<number, JawabanWawancara>;
  /** pertanyaan yang sedang tampil (0–4); 5 = ringkasan */
  wawancaraIdx: number;
  /** true setelah sesi wawancara ini dikirim ke riwayat (login) */
  attemptSaved: boolean;
  /** hasil roadmap adaptif terakhir (catatan ditampilkan di atas roadmap) */
  roadmapAdaptif: CatatanAdaptif | null;
  /** usulan jalur karier (mode eksplorasi) sebelum pengguna memilih */
  jalur: JalurKarier[] | null;
  /** ringkasan usulan mentor AI untuk jalur di atas (opsional; kosong bila AI gagal) */
  ringkasanJalur: string | null;
  /** id analisis tersimpan (login) */
  savedId: string | null;
  /** kunci centang roadmap → id butir di server (untuk PATCH) */
  roadmapItemIds: Record<string, number>;
};

const INITIAL: FlowState = {
  demo: false,
  goalText: "",
  intent: null,
  confirmed: false,
  jobDescription: "",
  profile: null,
  gap: null,
  roadmap: null,
  roadmapDone: {},
  questions: null,
  answers: {},
  wawancaraIdx: 0,
  attemptSaved: false,
  roadmapAdaptif: null,
  jalur: null,
  ringkasanJalur: null,
  savedId: null,
  roadmapItemIds: {},
};

/** Field turunan yang harus dikosongkan saat analisis baru dibuat (profil/gap baru). */
export const RESET_ANALISIS: Partial<FlowState> = {
  roadmap: null,
  roadmapDone: {},
  questions: null,
  answers: {},
  wawancaraIdx: 0,
  attemptSaved: false,
  roadmapAdaptif: null,
  savedId: null,
  roadmapItemIds: {},
};

const KEY = "careerium:alur:v1";

type FlowCtx = {
  state: FlowState;
  /** false sampai sessionStorage selesai dibaca; halaman menampilkan skeleton dulu */
  ready: boolean;
  update: (patch: Partial<FlowState> | ((s: FlowState) => Partial<FlowState>)) => void;
  reset: (keep?: Partial<FlowState>) => void;
};

const Ctx = createContext<FlowCtx | null>(null);

export function FlowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FlowState>(INITIAL);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hidrasi satu kali dari penyimpanan browser
      if (raw) setState({ ...INITIAL, ...(JSON.parse(raw) as Partial<FlowState>) });
    } catch {
      // penyimpanan tidak tersedia (mode privat) → mulai kosong
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // abaikan: alur tetap jalan tanpa penyimpanan
    }
  }, [state, ready]);

  const update = useCallback<FlowCtx["update"]>((patch) => {
    setState((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }));
  }, []);

  const reset = useCallback<FlowCtx["reset"]>((keep) => setState({ ...INITIAL, ...keep }), []);

  const value = useMemo(() => ({ state, ready, update, reset }), [state, ready, update, reset]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFlow() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFlow harus dipakai di dalam <FlowProvider>");
  return ctx;
}
