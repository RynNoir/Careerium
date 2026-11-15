"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { GapResult } from "@/lib/schemas";

/** Radar skill kamu vs kebutuhan posisi. Sumbu dari `radar[].label` (berbeda per posisi). */
export function RadarCard({ radar }: { radar: GapResult["radar"] }) {
  const reduced = useReducedMotion();
  const ringkas = radar.map((r) => `${r.label}: kamu ${Math.round(r.kamu)}, target ${Math.round(r.target)}`).join("; ");

  return (
    <section className="card flex flex-col gap-2 lg:h-full lg:min-h-0">
      <h2 className="text-[17px]">Peta skill</h2>
      <figure role="img" aria-label={`Radar skill dari 0 sampai 100. ${ringkas}.`} className="m-0 h-[300px] w-full lg:h-auto lg:min-h-0 lg:flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radar} outerRadius="68%" margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
            <PolarGrid stroke="var(--border-soft)" />
            <PolarAngleAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Kebutuhan posisi"
              dataKey="target"
              stroke="var(--chart-target)"
              strokeWidth={2}
              strokeDasharray="5 4"
              fill="none"
              isAnimationActive={!reduced}
            />
            <Radar
              name="Skill kamu"
              dataKey="kamu"
              stroke="var(--chart-user)"
              strokeWidth={2.5}
              fill="var(--primary)"
              fillOpacity={0.55}
              dot={{ r: 3, fill: "var(--text)", strokeWidth: 0 }}
              isAnimationActive={!reduced}
            />
          </RadarChart>
        </ResponsiveContainer>
      </figure>
      <div className="flex flex-wrap justify-center gap-4 text-[13px] text-text-muted" aria-hidden="true">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-5 rounded-sm border-[2.5px] border-chart-user bg-primary/55" /> Skill kamu
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0 w-5 border-t-2 border-dashed border-chart-target" /> Kebutuhan posisi
        </span>
      </div>
    </section>
  );
}
