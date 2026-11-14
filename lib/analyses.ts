// Penyimpanan riwayat (hanya pengguna login). Setiap fungsi menerima userId dan memeriksa pemilik:
// data milik orang lain diperlakukan seperti tidak ada (null -> 404).
import { randomUUID } from "node:crypto";
import { getDb } from "./db";
import type {
  AnalysisCreate,
  AnalysisDetail,
  AnalysisSummary,
  InterviewAttempt,
  InterviewAttemptCreate,
} from "./schemas";

type ItemIsi = { jenis: "kegiatan" | "mini_proyek"; teks: string; fokus: string };

export async function createAnalysis(userId: string, a: AnalysisCreate): Promise<string> {
  const id = randomUUID();
  const now = Date.now();
  const items = a.roadmap.minggu.flatMap((w) => [
    ...w.kegiatan.map((teks): [number, ItemIsi] => [w.minggu, { jenis: "kegiatan", teks, fokus: w.fokus }]),
    [w.minggu, { jenis: "mini_proyek", teks: w.mini_proyek, fokus: w.fokus }] as [number, ItemIsi],
  ]);
  await getDb().batch(
    [
      {
        sql: `INSERT INTO analyses (id, user_id, target_posisi, tahap, skor, skill_json, gap_json, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, userId, a.posisi, a.tahap, a.gap.skor, JSON.stringify(a.profile), JSON.stringify(a.gap), now],
      },
      ...items.map(([minggu, isi]) => ({
        sql: "INSERT INTO roadmap_items (analysis_id, minggu, isi_json, selesai) VALUES (?, ?, ?, 0)",
        args: [id, minggu, JSON.stringify(isi)],
      })),
    ],
    "write",
  );
  return id;
}

export async function listAnalyses(userId: string): Promise<AnalysisSummary[]> {
  const rs = await getDb().execute({
    sql: `SELECT id, target_posisi, tahap, skor, created_at FROM analyses
          WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    args: [userId],
  });
  return rs.rows.map((r) => ({
    id: String(r.id),
    target_posisi: String(r.target_posisi),
    tahap: r.tahap as AnalysisSummary["tahap"],
    skor: Number(r.skor),
    created_at: Number(r.created_at),
  }));
}

export async function getAnalysis(userId: string, id: string): Promise<AnalysisDetail | null> {
  const db = getDb();
  const rs = await db.execute({ sql: "SELECT * FROM analyses WHERE id = ? AND user_id = ?", args: [id, userId] });
  const a = rs.rows[0];
  if (!a) return null;

  const [items, attempts] = await Promise.all([
    db.execute({ sql: "SELECT id, minggu, isi_json, selesai FROM roadmap_items WHERE analysis_id = ? ORDER BY minggu, id", args: [id] }),
    db.execute({
      sql: "SELECT percobaan_ke, skor_total, skor_detail_json, created_at FROM interview_attempts WHERE analysis_id = ? ORDER BY percobaan_ke",
      args: [id],
    }),
  ]);

  const weeks = new Map<number, AnalysisDetail["roadmap"][number]>();
  for (const r of items.rows) {
    const minggu = Number(r.minggu);
    const isi = JSON.parse(String(r.isi_json)) as ItemIsi;
    if (!weeks.has(minggu)) weeks.set(minggu, { minggu, fokus: isi.fokus, items: [] });
    weeks.get(minggu)!.items.push({ id: Number(r.id), jenis: isi.jenis, teks: isi.teks, selesai: Number(r.selesai) === 1 });
  }

  return {
    id: String(a.id),
    target_posisi: String(a.target_posisi),
    tahap: a.tahap as AnalysisDetail["tahap"],
    skor: Number(a.skor),
    created_at: Number(a.created_at),
    profile: JSON.parse(String(a.skill_json)),
    gap: JSON.parse(String(a.gap_json)),
    roadmap: [...weeks.values()],
    interviews: attempts.rows.map((r) => ({
      percobaan_ke: Number(r.percobaan_ke),
      skor_total: Number(r.skor_total),
      detail: JSON.parse(String(r.skor_detail_json)),
      created_at: Number(r.created_at),
    })),
  };
}

/** false jika butir tidak ada atau bukan milik pengguna. */
export async function setRoadmapItem(userId: string, analysisId: string, itemId: number, selesai: boolean): Promise<boolean> {
  const rs = await getDb().execute({
    sql: `UPDATE roadmap_items SET selesai = ?
          WHERE id = ? AND analysis_id = ?
            AND analysis_id IN (SELECT id FROM analyses WHERE id = ? AND user_id = ?)`,
    args: [selesai ? 1 : 0, itemId, analysisId, analysisId, userId],
  });
  return rs.rowsAffected > 0;
}

/** null jika analisis bukan milik pengguna. percobaan_ke dihitung otomatis, skor_total = rata-rata. */
export async function addInterviewAttempt(
  userId: string,
  analysisId: string,
  body: InterviewAttemptCreate,
): Promise<Pick<InterviewAttempt, "percobaan_ke" | "skor_total"> | null> {
  const skorTotal = Math.round(body.detail.reduce((s, d) => s + d.skor_total, 0) / body.detail.length);
  const rs = await getDb().execute({
    sql: `INSERT INTO interview_attempts (analysis_id, percobaan_ke, skor_total, skor_detail_json, created_at)
          SELECT a.id, COALESCE((SELECT MAX(percobaan_ke) FROM interview_attempts WHERE analysis_id = a.id), 0) + 1, ?, ?, ?
          FROM analyses a WHERE a.id = ? AND a.user_id = ?
          RETURNING percobaan_ke`,
    args: [skorTotal, JSON.stringify(body.detail), Date.now(), analysisId, userId],
  });
  const row = rs.rows[0];
  return row ? { percobaan_ke: Number(row.percobaan_ke), skor_total: skorTotal } : null;
}
