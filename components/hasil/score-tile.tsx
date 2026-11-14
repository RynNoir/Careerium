"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { KETERANGAN_SKOR, rincianSkor, sumberLowongan } from "@/lib/pesan-template";
import type { GapResult } from "@/lib/schemas";

/** Ubin skor (pengganti cincin skor, DESIGN.md §6). Angka dari lib/scoring.ts di server. */
export function ScoreTile({ gap }: { gap: GapResult }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 700);
      setShown(Math.round(gap.skor * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gap.skor, reduced]);

  return (
    <section className="card relative flex flex-col gap-2 bg-primary pt-5" aria-label={`Skor kecocokan ${gap.skor} dari 100`}>
      <span
        aria-hidden="true"
        className="absolute -top-2.5 left-1/2 h-[18px] w-[66px] -translate-x-1/2 -rotate-3 border-2 border-ink bg-accent"
      />
      <p className="label-caps text-text">Skor kecocokan</p>
      <p className="font-display text-[64px] leading-[0.9] font-extrabold tabular-nums lg:text-[80px]" aria-hidden="true">
        {reduced ? gap.skor : shown}
        <span className="text-[22px]">/100</span>
      </p>
      {rincianSkor(gap.skor_rincian) && <p className="text-[13px] font-semibold">{rincianSkor(gap.skor_rincian)}</p>}
      <p className="text-[12px] font-semibold">{KETERANGAN_SKOR}</p>
      <p className="text-[12px]">{sumberLowongan(gap.sumberLowongan)}</p>
    </section>
  );
}
