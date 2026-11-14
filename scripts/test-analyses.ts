// Uji API riwayat lewat HTTP (butuh `npm run dev` berjalan). Memakai 2 akun uji di database lokal.
// Pemakaian: npx tsx scripts/test-analyses.ts [http://localhost:3000]
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const BASE = process.argv[2] || "http://localhost:3000";
const rani = JSON.parse(readFileSync("data/demo/rani.json", "utf8"));

function client() {
  let cookie = "";
  return async (path: string, init: { method?: string; body?: unknown } = {}) => {
    const res = await fetch(BASE + path, {
      method: init.method ?? (init.body ? "POST" : "GET"),
      headers: { "content-type": "application/json", cookie },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    const set = res.headers.getSetCookie().find((c) => c.startsWith("careerium_session="));
    if (set) cookie = set.split(";")[0];
    return { status: res.status, json: await res.json().catch(() => null) };
  };
}

const analysis = {
  posisi: "Web Developer",
  tahap: "semester_akhir",
  profile: rani.profile,
  gap: {
    kekuatan: [{ nama: "JavaScript", tingkat: "menengah", bukti: "Membuat aplikasi to-do list dengan JavaScript dan localStorage" }],
    gap: [{ nama: "TypeScript", prioritas: "penting", kategori_radar: "teknologi_inti", jumlah_muncul: 5 }],
    skor: 61,
    radar: [{ kategori: "teknologi_inti", kamu: 60, target: 100 }],
    sumberLowongan: { jumlah: 10, perkiraanUmum: false },
  },
  roadmap: {
    minggu: [1, 2, 3, 4].map((m) => ({ minggu: m, fokus: `Fokus ${m}`, kegiatan: [`Kegiatan ${m}a`, `Kegiatan ${m}b`], mini_proyek: `Proyek ${m}` })),
  },
};

const results: string[] = [];
async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push(`LULUS  ${name}`);
  } catch (e) {
    results.push(`GAGAL  ${name}\n       ${(e as Error).message.split("\n")[0]}`);
  }
}

async function main() {
  const a = client();
  const b = client();
  const stamp = Date.now();
  await a("/api/auth/register", { body: { email: `uji-a-${stamp}@contoh.test`, password: "rahasia-123" } });
  await b("/api/auth/register", { body: { email: `uji-b-${stamp}@contoh.test`, password: "rahasia-123" } });
  let id = "";
  let itemId = 0;

  await test("tanpa login -> 401", async () => {
    assert.equal((await client()("/api/analyses")).status, 401);
  });
  await test("A simpan analisis -> 201 + id", async () => {
    const r = await a("/api/analyses", { body: analysis });
    assert.equal(r.status, 201);
    id = r.json.id;
    assert.ok(id);
  });
  await test("body tidak valid -> 400", async () => {
    assert.equal((await a("/api/analyses", { body: { ...analysis, tahap: "semester_99" } })).status, 400);
  });
  await test("A daftar riwayat berisi analisis itu", async () => {
    const r = await a("/api/analyses");
    assert.equal(r.json[0].id, id);
    assert.equal(r.json[0].skor, 61);
  });
  await test("A detail: data sama + roadmap 4 minggu × 3 butir", async () => {
    const r = await a(`/api/analyses/${id}`);
    assert.equal(r.status, 200);
    assert.deepEqual(r.json.profile, rani.profile);
    assert.deepEqual(r.json.gap, analysis.gap);
    assert.equal(r.json.roadmap.length, 4);
    assert.equal(r.json.roadmap[0].items.length, 3);
    itemId = r.json.roadmap[0].items[0].id;
  });
  await test("B buka detail milik A -> 404", async () => {
    assert.equal((await b(`/api/analyses/${id}`)).status, 404);
  });
  await test("B daftar riwayat tidak melihat milik A", async () => {
    assert.equal((await b("/api/analyses")).json.length, 0);
  });
  await test("B centang roadmap milik A -> 404", async () => {
    assert.equal((await b(`/api/analyses/${id}/roadmap/${itemId}`, { method: "PATCH", body: { selesai: true } })).status, 404);
  });
  await test("A centang roadmap -> tersimpan", async () => {
    assert.equal((await a(`/api/analyses/${id}/roadmap/${itemId}`, { method: "PATCH", body: { selesai: true } })).status, 200);
    const r = await a(`/api/analyses/${id}`);
    assert.equal(r.json.roadmap[0].items[0].selesai, true);
  });
  const detail = [
    { pertanyaan: "Q1", gap_asal: "TypeScript", status: "dinilai", skor_total: 60 },
    { pertanyaan: "Q2", gap_asal: "TypeScript", status: "dinilai", skor_total: 81 },
  ];
  await test("A wawancara percobaan 1 & 2 (nomor otomatis, skor rata-rata)", async () => {
    const r1 = await a(`/api/analyses/${id}/interviews`, { body: { detail } });
    assert.deepEqual(r1.json, { percobaan_ke: 1, skor_total: 71 });
    const r2 = await a(`/api/analyses/${id}/interviews`, { body: { detail: [detail[1]] } });
    assert.deepEqual(r2.json, { percobaan_ke: 2, skor_total: 81 });
    const d = await a(`/api/analyses/${id}`);
    assert.deepEqual(d.json.interviews.map((i: { skor_total: number }) => i.skor_total), [71, 81]);
  });
  await test("B tambah wawancara ke milik A -> 404", async () => {
    assert.equal((await b(`/api/analyses/${id}/interviews`, { body: { detail } })).status, 404);
  });
  await test("hapus akun A menghapus riwayatnya", async () => {
    assert.equal((await a("/api/auth/delete", { body: {} })).status, 200);
    assert.equal((await a(`/api/analyses/${id}`)).status, 401);
  });
  await b("/api/auth/delete", { body: {} });

  console.log(results.join("\n"));
  const fail = results.filter((r) => r.startsWith("GAGAL")).length;
  console.log(fail ? `\n${fail} gagal` : `\n${results.length}/${results.length} lulus`);
  process.exit(fail ? 1 : 0);
}

main();
