"use client";

import { Check } from "lucide-react";
import type { Roadmap } from "@/lib/schemas";

export const roadmapKey = (minggu: number, i: number | "mp") => `${minggu}-${i}`;

/** Roadmap 4 minggu dengan kotak centang. `done` dikendalikan pemanggil (state sesi / tersimpan). */
export function RoadmapList({
  roadmap,
  done,
  onToggle,
}: {
  roadmap: Roadmap;
  done: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {roadmap.minggu.map((w) => {
        const keys = [...w.kegiatan.map((_, i) => roadmapKey(w.minggu, i)), roadmapKey(w.minggu, "mp")];
        const selesai = keys.filter((k) => done[k]).length;
        return (
          <section key={w.minggu} className="card flex flex-col gap-3" aria-labelledby={`minggu-${w.minggu}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="badge bg-accent text-[12px]">Minggu {w.minggu}</span>
              <span className="text-[13px] text-text-muted tabular-nums">
                {selesai}/{keys.length} selesai
              </span>
            </div>
            <h3 id={`minggu-${w.minggu}`} className="text-[17px] leading-snug">
              {w.fokus}
            </h3>
            <ul className="flex flex-col">
              {w.kegiatan.map((k, i) => (
                <li key={i}>
                  <Centang label={k} checked={!!done[keys[i]]} onChange={(v) => onToggle(keys[i], v)} />
                </li>
              ))}
            </ul>
            <div className="rounded-[10px] bg-surface-muted p-2">
              <p className="label-caps px-1">Mini-proyek</p>
              <Centang label={w.mini_proyek} checked={!!done[keys.at(-1)!]} onChange={(v) => onToggle(keys.at(-1)!, v)} />
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Centang({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1.5 text-[15px]">
      <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
        <input
          type="checkbox"
          className="peer size-5 cursor-pointer appearance-none rounded-[5px] border-2 border-ink bg-surface checked:bg-primary"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <Check
          className="pointer-events-none absolute hidden size-3.5 text-text peer-checked:block"
          strokeWidth={3}
          aria-hidden="true"
        />
      </span>
      <span className={checked ? "text-text-muted line-through" : ""}>{label}</span>
    </label>
  );
}
