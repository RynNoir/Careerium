"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { InterviewAttempt } from "@/lib/schemas";

/** Skor wawancara antar percobaan (DESIGN.md §8): garis primary-text 2,5 px, titik bergaris tinta. */
export function SkorChart({ attempts }: { attempts: InterviewAttempt[] }) {
  const reduced = useReducedMotion();
  const data = attempts.map((a) => ({ nama: `Ke-${a.percobaan_ke}`, skor: a.skor_total }));
  const ringkas = attempts.map((a) => `percobaan ${a.percobaan_ke}: ${a.skor_total}`).join(", ");
  return (
    <figure role="img" aria-label={`Skor wawancara per percobaan, 0 sampai 100. ${ringkas}.`} className="m-0 h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: -16 }}>
          <CartesianGrid stroke="var(--border-soft)" vertical={false} />
          <XAxis dataKey="nama" tick={{ fontSize: 12, fill: "var(--text-muted)" }} stroke="var(--border-soft)" />
          <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tick={{ fontSize: 12, fill: "var(--text-muted)" }} stroke="var(--border-soft)" />
          <Line
            type="monotone"
            dataKey="skor"
            stroke="var(--primary-text)"
            strokeWidth={2.5}
            dot={{ r: 5, fill: "var(--primary)", stroke: "var(--border)", strokeWidth: 2 }}
            isAnimationActive={!reduced}
          />
        </LineChart>
      </ResponsiveContainer>
    </figure>
  );
}
