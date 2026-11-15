"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Pencil, Sparkles } from "lucide-react";
import { AiErrorAksi } from "@/components/ai-error-aksi";
import { useFlow, type Tahap, type Tujuan } from "@/components/flow-provider";
import { EmptyState, ErrorCard, Kira, StageLoading, Steps } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";
import { demoRani } from "@/lib/demo-data";
import { MAX_GOAL_CHARS, MAX_JOB_DESC_CHARS } from "@/lib/limits";
import {
  CATATAN_EKSPLORASI,
  CATATAN_PERKIRAAN,
  CONTOH_TUJUAN,
  LABEL_POSISI,
  LABEL_TAHAP,
  LABEL_TUJUAN,
  PENOLAKAN,
  PERTANYAAN_LANJUTAN,
  pesanError,
} from "@/lib/pesan-template";
import type { Intent, PosisiPreset } from "@/lib/schemas";

const CHIP_BG = ["bg-primary-soft", "bg-lilac", "bg-accent-soft"];
const TUJUAN_PILIHAN: Exclude<Tujuan, "tidak_jelas">[] = ["magang", "kerja", "tingkatkan_skill", "eksplorasi"];

export function MulaiView() {
  const { state, update, reset } = useFlow();
  const router = useRouter();
  const [text, setText] = useState(state.goalText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorObj, setErrorObj] = useState<unknown>(null); // ApiError asli: kode & waktu tunggu untuk arahan "Coba lagi"
  const inputId = useId();
  const intent = state.intent;

  async function pahami(kalimat: string, demo: boolean) {
    const t = kalimat.trim();
    if (!t) return;
    setError(null);
    setErrorObj(null);
    setLoading(true);
    reset({ goalText: t, demo });
    try {
      const intent = await api.intent({ text: t, demo: demo || undefined });
      update({ intent });
    } catch (e) {
      setErrorObj(e);
      setError(e instanceof ApiError ? e.message : pesanError(0));
    } finally {
      setLoading(false);
    }
  }

  function cobaDemo() {
    setText(demoRani.tujuan);
    void pahami(demoRani.tujuan, true);
  }

  function ubahKalimat() {
    update({ intent: null, confirmed: false });
  }

  return (
    <div className="flex flex-col gap-5">
      <Steps aktif={1} />
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <h1 className="display">
            Mau jadi <span className="hl">apa</span> kamu nanti?
          </h1>
          <p className="max-w-[65ch] text-text-muted">
            Ceritakan tujuanmu dengan kalimat bebas. Kira akan memetakan skill, gap, dan roadmap belajarmu.
          </p>
        </div>
        {/* Maksimal satu Kira per layar: kartu penolakan punya Kira sendiri. */}
        {!intent && <Kira pose="menyapa" size={80} className="shrink-0 lg:w-27.5" />}
      </div>

      {state.demo && (
        <p className="flex flex-wrap items-center gap-2 text-[14px]">
          <span className="badge bg-accent">Mode demo aktif</span>
          <span className="text-text-muted">Memakai persona fiktif Rani.</span>
          <button
            type="button"
            className="min-h-11 font-bold text-primary-text underline underline-offset-2"
            onClick={() => {
              setText("");
              reset({ goalText: "" });
            }}
          >
            Matikan
          </button>
        </p>
      )}

      {!intent ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void pahami(text, state.demo);
          }}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor={inputId} className="font-semibold">
              Tujuan karierku
            </label>
            <textarea
              id={inputId}
              className="field min-h-30 resize-y"
              value={text}
              maxLength={MAX_GOAL_CHARS}
              onChange={(e) => setText(e.target.value)}
              placeholder="Contoh: Aku semester 6 Informatika, pengen magang jadi web developer tapi bingung skill apa yang kurang."
              aria-describedby={`${inputId}-count`}
              disabled={loading}
            />
            <p id={`${inputId}-count`} className="self-end text-[13px] text-text-muted tabular-nums">
              {text.length}/{MAX_GOAL_CHARS}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="label-caps">Atau pilih contoh</p>
            <div className="flex flex-wrap gap-2">
              {CONTOH_TUJUAN.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  className={`chip text-left ${CHIP_BG[i % CHIP_BG.length]}`}
                  onClick={() => setText(c)}
                  disabled={loading}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <StageLoading tahap="Kira sedang memahami tujuanmu…" lines={2} />
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={!text.trim()}>
                Pahami tujuanku <ArrowRight className="size-4" aria-hidden="true" />
              </button>
              <button type="button" className="btn btn-secondary w-full sm:w-auto" onClick={cobaDemo}>
                <Sparkles className="size-4" aria-hidden="true" /> Coba mode demo
              </button>
            </div>
          )}
          {error && <ErrorCard message={error} action={<AiErrorAksi error={errorObj} onRetry={() => void pahami(text, state.demo)} />} />}
          <p className="text-[13px] text-text-muted">Bisa tanpa akun. Hasilmu tersimpan di browser ini selama sesi.</p>
        </form>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3 rounded-btn border-2 border-dashed border-border-soft px-3 py-2">
            <p className="text-[15px] text-text-muted">&ldquo;{state.goalText}&rdquo;</p>
            <button type="button" className="min-h-11 min-w-11 shrink-0 px-1 font-bold text-primary-text" onClick={ubahKalimat}>
              Ubah
            </button>
          </div>
          <IntentResult
            intent={intent}
            onUbah={ubahKalimat}
            onLanjut={() => {
              update({ confirmed: true });
              router.push("/profil");
            }}
          />
        </>
      )}
    </div>
  );
}

function IntentResult({ intent, onUbah, onLanjut }: { intent: Intent; onUbah: () => void; onLanjut: () => void }) {
  const { update } = useFlow();
  const setIntent = (patch: Partial<Intent>) => update((s) => ({ intent: s.intent && { ...s.intent, ...patch } }));

  if (intent.kategori !== "karier_ti") {
    const p = PENOLAKAN[intent.kategori];
    return (
      <EmptyState
        pose="menyemangati"
        judul={p.judul}
        action={
          <button type="button" className="btn btn-secondary w-full sm:w-auto" onClick={onUbah}>
            Tulis ulang tujuanku
          </button>
        }
      >
        {p.isi}
      </EmptyState>
    );
  }

  if (intent.tujuan === "tidak_jelas" || intent.kepercayaan < 0.6) {
    return (
      <div className="card flex flex-col gap-3">
        <h2 className="text-[18px]">{PERTANYAAN_LANJUTAN}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {TUJUAN_PILIHAN.map((t) => (
            <button key={t} type="button" className="btn btn-secondary justify-start" onClick={() => setIntent({ tujuan: t, kepercayaan: 1 })}>
              {LABEL_TUJUAN[t]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return <KartuKonfirmasi intent={intent} setIntent={setIntent} onUbah={onUbah} onLanjut={onLanjut} />;
}

function KartuKonfirmasi({
  intent,
  setIntent,
  onUbah,
  onLanjut,
}: {
  intent: Intent;
  setIntent: (p: Partial<Intent>) => void;
  onUbah: () => void;
  onLanjut: () => void;
}) {
  const { state, update } = useFlow();
  const [edit, setEdit] = useState<null | "tujuan" | "posisi" | "tahap">(null);
  const [lainnya, setLainnya] = useState(intent.posisi_target !== null && intent.posisi_preset === null);
  const id = useId();
  const posisiOk = !!intent.posisi_target?.trim();
  // Tanpa posisi, atau tujuan eksplorasi: Kira mengusulkan jalur setelah membaca CV (mode eksplorasi).
  const eksplorasi = intent.tujuan === "eksplorasi" || !posisiOk;
  const siap = intent.tahap !== null;

  return (
    <section className="card flex flex-col gap-4" aria-labelledby={`${id}-judul`}>
      <h2 id={`${id}-judul`} className="text-[18px]">
        Ini yang Kira tangkap. Sudah benar?
      </h2>

      <dl className="flex flex-col gap-3">
        <Baris
          label="Tujuan"
          nilai={LABEL_TUJUAN[intent.tujuan]}
          editing={edit === "tujuan"}
          onEdit={() => setEdit(edit === "tujuan" ? null : "tujuan")}
        >
          <select
            className="field"
            aria-label="Pilih tujuan"
            value={intent.tujuan}
            onChange={(e) => {
              setIntent({ tujuan: e.target.value as Tujuan });
              setEdit(null);
            }}
          >
            {TUJUAN_PILIHAN.map((t) => (
              <option key={t} value={t}>
                {LABEL_TUJUAN[t]}
              </option>
            ))}
          </select>
        </Baris>

        <Baris
          label="Posisi"
          nilai={intent.posisi_target?.trim() || "Belum tahu, Kira usulkan"}
          editing={edit === "posisi"}
          onEdit={() => setEdit(edit === "posisi" ? null : "posisi")}
        >
          <select
            className="field"
            aria-label="Pilih posisi target"
            value={lainnya ? "lainnya" : (intent.posisi_preset ?? "")}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "lainnya") {
                setLainnya(true);
                setIntent({ posisi_preset: null });
              } else if (v) {
                setLainnya(false);
                setIntent({ posisi_preset: v as PosisiPreset, posisi_target: LABEL_POSISI[v as PosisiPreset] });
                setEdit(null);
              }
            }}
          >
            <option value="" disabled>
              Pilih posisi
            </option>
            {(Object.keys(LABEL_POSISI) as PosisiPreset[]).map((p) => (
              <option key={p} value={p}>
                {LABEL_POSISI[p]}
              </option>
            ))}
            <option value="lainnya">Posisi lain (tulis sendiri)</option>
          </select>
          {lainnya && (
            <input
              className="field mt-2"
              aria-label="Nama posisi"
              placeholder="Contoh: Game Developer"
              maxLength={100}
              value={intent.posisi_target ?? ""}
              onChange={(e) => setIntent({ posisi_target: e.target.value })}
            />
          )}
        </Baris>

        <Baris
          label="Tahap"
          nilai={intent.tahap ? LABEL_TAHAP[intent.tahap] : "Belum ada, pilih dulu"}
          editing={edit === "tahap" || intent.tahap === null}
          onEdit={() => setEdit(edit === "tahap" ? null : "tahap")}
        >
          <select
            className="field"
            aria-label="Pilih tahap kuliah"
            value={intent.tahap ?? ""}
            onChange={(e) => {
              setIntent({ tahap: e.target.value as Tahap });
              setEdit(null);
            }}
          >
            <option value="" disabled>
              Pilih tahapmu
            </option>
            {(Object.keys(LABEL_TAHAP) as Tahap[]).map((t) => (
              <option key={t} value={t}>
                {LABEL_TAHAP[t]}
              </option>
            ))}
          </select>
        </Baris>
      </dl>

      {eksplorasi && (
        <p className="rounded-btn bg-primary-soft p-3 text-[14px]">{CATATAN_EKSPLORASI}</p>
      )}

      {intent.posisi_preset === null && posisiOk && !eksplorasi && (
        <div className="flex flex-col gap-2 rounded-btn bg-gap-soft p-3">
          <label htmlFor={`${id}-jd`} className="text-[14px] font-semibold">
            Deskripsi lowongan (opsional)
          </label>
          <p className="text-[13px]">{CATATAN_PERKIRAAN}</p>
          <textarea
            id={`${id}-jd`}
            className="field min-h-24"
            maxLength={MAX_JOB_DESC_CHARS}
            value={state.jobDescription}
            onChange={(e) => update({ jobDescription: e.target.value })}
          />
        </div>
      )}

      {!siap && (
        <p className="text-[14px] font-semibold text-gap" role="status">
          Pilih tahapmu dulu, ya.
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" className="btn btn-primary w-full sm:w-auto" disabled={!siap} onClick={onLanjut}>
          Ya, lanjut <ArrowRight className="size-4" aria-hidden="true" />
        </button>
        <button type="button" className="btn btn-secondary w-full sm:w-auto" onClick={onUbah}>
          Ubah kalimat
        </button>
      </div>
    </section>
  );
}

function Baris({
  label,
  nilai,
  editing,
  onEdit,
  children,
}: {
  label: string;
  nilai: string;
  editing: boolean;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="label-caps">{label}</dt>
      <dd className="flex flex-col">
        {editing ? (
          children
        ) : (
          <button type="button" className="chip self-start bg-surface" onClick={onEdit} aria-label={`Ubah ${label.toLowerCase()}: ${nilai}`}>
            {nilai} <Pencil className="size-3.25" aria-hidden="true" />
          </button>
        )}
      </dd>
    </div>
  );
}
