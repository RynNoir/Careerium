// Uji audit kode atas hasil AI asesor (lib/prompts/penilaian.ts), tanpa LLM dan tanpa kuota.
// Pemakaian: npx tsx scripts/test-penilaian.ts
import { ALASAN_TANPA_BUKTI, auditPenilaian } from "../lib/prompts/penilaian";
import type { Kebutuhan } from "../lib/scoring";

let gagal = 0;
const cek = (nama: string, ok: boolean, info?: unknown) => {
  console.log(`${ok ? "LULUS" : "GAGAL"}  ${nama}${ok || info === undefined ? "" : `\n       ${JSON.stringify(info)}`}`);
  if (!ok) gagal++;
};

const K: Kebutuhan[] = [
  { nama: "HTML & CSS", prioritas: "penting", kategori_radar: "frontend", jumlah_muncul: 9 },
  { nama: "JavaScript (ES6+)", prioritas: "wajib", kategori_radar: "frontend", jumlah_muncul: 9 },
  { nama: "Bahasa/framework backend", prioritas: "wajib", kategori_radar: "backend", jumlah_muncul: 8 },
  { nama: "Git & GitHub/GitLab", prioritas: "wajib", kategori_radar: "tools", jumlah_muncul: 7 },
  { nama: "Docker", prioritas: "nilai_tambah", kategori_radar: "tools", jumlah_muncul: 2 },
];
const profile = {
  cv_valid: true,
  skills: [
    { nama: "HTML", jenis: "teknis" as const, tingkat: "dasar" as const, bukti: "Mengelola website himpunan menggunakan HTML, CSS, dan JavaScript" },
    { nama: "Git", jenis: "tools" as const, tingkat: "menengah" as const, bukti: "Kode disimpan dan dikelola dengan Git dan GitHub" },
  ],
  proyek: [{ nama: "Website Katalog UMKM", deskripsi: "tugas kuliah", bukti: "Membangun halaman katalog produk dengan React dan Tailwind CSS" }],
};

const hasil = auditPenilaian(
  {
    penilaian: [
      { kebutuhan: "HTML & CSS", nilai: 3, alasan: "Kamu sudah memakainya untuk website himpunan.", bukti: "Mengelola website himpunan menggunakan HTML, CSS, dan JavaScript" },
      // satu kalimat membuktikan dua kebutuhan; huruf besar/kecil berbeda tetap cocok
      { kebutuhan: "javascript (es6+)", nilai: 3, alasan: "Dipakai nyata di organisasi.", bukti: "mengelola website himpunan menggunakan html, css, dan javascript" },
      // bukti karangan -> dibatalkan
      { kebutuhan: "Bahasa/framework backend", nilai: 4, alasan: "Kamu memimpin tim backend.", bukti: "Memimpin tim backend Laravel 5 orang" },
      // nilai di luar rentang -> dibatasi 4; URL di alasan dibuang
      { kebutuhan: "Git & GitHub/GitLab", nilai: 7, alasan: "Rapi, lihat github.com/rani ya", bukti: "dikelola dengan Git dan GitHub" },
      // duplikat -> yang pertama dipakai
      { kebutuhan: "Git & GitHub/GitLab", nilai: 0, alasan: "duplikat", bukti: "" },
      // kebutuhan karangan -> diabaikan
      { kebutuhan: "Kubernetes", nilai: 4, alasan: "x", bukti: "Kode disimpan dan dikelola dengan Git dan GitHub" },
      { kebutuhan: "Docker", nilai: 0, alasan: "Belum terlihat di CV-mu.", bukti: "" },
    ],
    ringkasan: "<b>Kamu</b> kuat di frontend. Kunjungi https://contoh.id untuk belajar backend.",
  },
  K,
  profile,
);
const n = (k: string) => hasil.nilai.get(k);

cek("nilai berbukti sah dipertahankan (HTML & CSS = 3)", n("HTML & CSS")?.nilai === 3 && !!n("HTML & CSS")?.bukti, n("HTML & CSS"));
cek("satu kalimat CV membuktikan kebutuhan lain, beda huruf tetap cocok (JavaScript = 3)", n("JavaScript (ES6+)")?.nilai === 3, n("JavaScript (ES6+)"));
cek("bukti karangan -> nilai 0", n("Bahasa/framework backend")?.nilai === 0, n("Bahasa/framework backend"));
cek("bukti karangan -> alasan AI diganti template", n("Bahasa/framework backend")?.alasan === ALASAN_TANPA_BUKTI && !n("Bahasa/framework backend")?.bukti);
cek("nilai 7 dibatasi ke 4", n("Git & GitHub/GitLab")?.nilai === 4, n("Git & GitHub/GitLab"));
cek("URL di alasan dibuang", !/github\.com/.test(n("Git & GitHub/GitLab")?.alasan ?? "x"), n("Git & GitHub/GitLab")?.alasan);
cek("duplikat diabaikan (yang pertama dipakai)", n("Git & GitHub/GitLab")?.nilai === 4);
cek("kebutuhan karangan AI diabaikan", !hasil.nilai.has("Kubernetes") && hasil.nilai.size === 5, [...hasil.nilai.keys()]);
cek("nilai 0 tidak membawa bukti", n("Docker")?.nilai === 0 && n("Docker")?.bukti === undefined);
cek("ringkasan: tanda < > dan URL dibuang", !/[<>]|https?:|contoh\.id/.test(hasil.ringkasan) && hasil.ringkasan.includes("Kamu"), hasil.ringkasan);

const berlabel = auditPenilaian(
  {
    penilaian: [
      { kebutuhan: "HTML & CSS [penting]", nilai: 3, alasan: "x", bukti: "website himpunan menggunakan HTML, CSS" },
      { kebutuhan: "2. JavaScript (ES6+) [wajib]", nilai: 2, alasan: "x", bukti: "dan JavaScript" },
      { kebutuhan: "- Docker (nilai_tambah)", nilai: 0, alasan: "x", bukti: "" },
    ],
    ringkasan: "",
  },
  K,
  profile,
);
cek("label prioritas & penomoran yang ikut disalin AI tetap cocok", berlabel.nilai.get("HTML & CSS")?.nilai === 3 && berlabel.nilai.get("JavaScript (ES6+)")?.nilai === 2 && berlabel.nilai.has("Docker"), [...berlabel.nilai.entries()]);

const kosong = auditPenilaian({ penilaian: [{ kebutuhan: "HTML & CSS", nilai: 3, alasan: "x", bukti: "" }], ringkasan: "" }, K, profile);
cek("nilai > 0 tanpa kutipan -> 0", kosong.nilai.get("HTML & CSS")?.nilai === 0);
const pendek = auditPenilaian({ penilaian: [{ kebutuhan: "HTML & CSS", nilai: 3, alasan: "x", bukti: "dan" }], ringkasan: "" }, K, profile);
cek("kutipan terlalu pendek (< 4 huruf) tidak dianggap bukti", pendek.nilai.get("HTML & CSS")?.nilai === 0);
const dariProyek = auditPenilaian(
  { penilaian: [{ kebutuhan: "HTML & CSS", nilai: 2, alasan: "x", bukti: "katalog produk dengan React dan Tailwind CSS" }], ringkasan: "" },
  K,
  profile,
);
cek("kutipan dari bukti proyek juga sah", dariProyek.nilai.get("HTML & CSS")?.nilai === 2);

console.log(gagal ? `\n${gagal} gagal` : "\nSemua lulus");
process.exit(gagal ? 1 : 0);
