"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Save } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useFlow } from "@/components/flow-provider";
import { api, ApiError } from "@/lib/api-client";
import { pesanError } from "@/lib/pesan-template";
import { dariTersimpan } from "./roadmap-list";

/** Simpan hasil ke akun (login): POST /api/analyses lalu petakan butir roadmap untuk PATCH centang. */
export function SimpanHasil() {
  const { user } = useAuth();
  const { state, update } = useFlow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { intent, profile, gap, roadmap, savedId } = state;

  if (user === undefined) return null;
  if (!user)
    return (
      <p className="text-[14px] text-text-muted">
        <Link href="/masuk" className="inline-flex min-h-11 items-center font-bold text-primary-text underline underline-offset-2">
          Masuk
        </Link>{" "}
        untuk menyimpan hasil dan melihat riwayat progresmu.
      </p>
    );
  if (savedId)
    return (
      <p role="status" className="chip self-start bg-accent-soft">
        <Check className="size-4" aria-hidden="true" /> Hasil tersimpan di riwayat
      </p>
    );

  async function simpan() {
    if (!intent?.tahap || !intent.posisi_target || !profile || !gap || !roadmap) return;
    setError(null);
    setLoading(true);
    try {
      const { id } = await api.saveAnalysis({ posisi: intent.posisi_target, tahap: intent.tahap, profile, gap, roadmap });
      const { ids } = dariTersimpan((await api.getAnalysis(id)).roadmap);
      // Centang yang sudah dibuat sebelum login ikut dikirim.
      await Promise.all(
        Object.entries(state.roadmapDone)
          .filter(([k, v]) => v && ids[k])
          .map(([k]) => api.setRoadmapItem(id, ids[k], true)),
      );
      update({ savedId: id, roadmapItemIds: ids, attemptSaved: false });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : pesanError(0));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button type="button" className="btn btn-secondary w-full sm:w-auto sm:self-start" onClick={simpan} disabled={loading || !roadmap}>
        <Save className="size-4" aria-hidden="true" /> {loading ? "Menyimpan…" : "Simpan hasil"}
      </button>
      {!roadmap && <p className="text-[13px] text-text-muted">Susun roadmap dulu sebelum menyimpan.</p>}
      {error && (
        <p role="alert" className="text-[14px] font-semibold text-error">
          {error}
        </p>
      )}
    </div>
  );
}
