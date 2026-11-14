// Persona demo Rani (fiktif) dari data/demo/rani.json, divalidasi dengan skema kontrak saat dimuat.
// Jika kontrak berubah dan JSON tidak cocok lagi, error muncul di sini (bukan diam-diam di layar).
import rani from "@/data/demo/rani.json";
import { GapResult, Grade, Intent, Profile, QuestionsResponse, Roadmap } from "./schemas";

export const demoRani = {
  tujuan: rani.input.tujuan,
  intent: Intent.parse(rani.intent),
  profile: Profile.parse(rani.profile),
  gap: GapResult.parse(rani.gap),
  roadmap: Roadmap.parse(rani.roadmap),
  questions: QuestionsResponse.parse(rani.questions).questions,
  contohJawaban: rani.contoh_jawaban.map((c) => ({
    pertanyaan: c.pertanyaan,
    jawaban: c.jawaban,
    grade: Grade.parse(c.grade),
  })),
};

/** Salinan data/demo/cv-rani.txt (data pribadi sudah berupa placeholder). */
export const CV_DEMO_RANI = `[NAMA]
[EMAIL] | [TELEPON] | [KOTA]

PENDIDIKAN
S1 Teknik Informatika, semester 6 (IPK 3,52)

PENGALAMAN ORGANISASI
Staf Divisi Media, Himpunan Mahasiswa Informatika (2024 - sekarang)
- Mengelola website himpunan menggunakan HTML, CSS, dan JavaScript
- Berkoordinasi dengan 5 anggota tim untuk jadwal publikasi mingguan

PROYEK
Website Katalog UMKM (tugas kuliah Pemrograman Web, 2025)
- Membangun halaman katalog produk dengan React dan Tailwind CSS
- Mengambil data produk dari REST API sederhana buatan teman satu tim
- Kode disimpan dan dikelola dengan Git dan GitHub

Aplikasi To-Do List (belajar mandiri)
- Membuat aplikasi to-do list dengan JavaScript dan localStorage

SKILL
HTML, CSS, JavaScript, React (dasar), Tailwind CSS, Git, Figma (dasar)

KURSUS
Kursus online dasar-dasar SQL (2025)`;
