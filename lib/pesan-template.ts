// Semua kalimat penolakan, error, label, dan gelembung Kira dibuat di sini (bukan oleh LLM). CLAUDE.md §4.
import type { GapResult, Intent, PosisiPreset } from "./schemas";

type Tahap = NonNullable<Intent["tahap"]>;

/** Dipakai bila server tidak mengirim `{ error }` (jaringan putus, respons bukan JSON). */
export const ERROR_UMUM: Record<number, string> = {
  0: "Koneksi ke server terputus. Periksa internetmu, lalu coba lagi.",
  400: "Masukan belum sesuai. Periksa lagi isiannya, lalu kirim ulang.",
  401: "Kamu perlu masuk dulu untuk memakai fitur ini.",
  404: "Data tidak ditemukan. Mungkin sudah dihapus atau bukan milikmu.",
  409: "Email ini sudah terdaftar. Coba masuk, atau pakai email lain.",
  429: "Batas pemakaian sementara tercapai. Tunggu sebentar, atau coba mode demo.",
  503: "AI sedang sibuk. Tunggu beberapa detik lalu coba lagi, atau pakai mode demo.",
};

export function pesanError(status: number): string {
  if (ERROR_UMUM[status]) return ERROR_UMUM[status];
  return status >= 500 ? ERROR_UMUM[503] : ERROR_UMUM[400];
}

// ---------- Label tampilan enum ----------
export const LABEL_TAHAP: Record<Tahap, string> = {
  semester_awal: "Semester awal (1–2)",
  semester_tengah: "Semester tengah (3–5)",
  semester_akhir: "Semester akhir (6+)",
  fresh_graduate: "Fresh graduate",
};

export const LABEL_TUJUAN: Record<Intent["tujuan"], string> = {
  kerja: "Cari kerja",
  magang: "Cari magang",
  tingkatkan_skill: "Tingkatkan skill",
  eksplorasi: "Eksplorasi jalur karier",
  tidak_jelas: "Belum jelas",
};

export const LABEL_POSISI: Record<PosisiPreset, string> = {
  web_frontend: "Web Developer (Frontend)",
  web_backend: "Web Developer (Backend)",
  mobile: "Mobile Developer",
  data_analyst: "Data Analyst",
  uiux: "UI/UX Designer",
  qa: "QA/Tester",
  cybersecurity: "Cybersecurity",
  devops: "DevOps",
};

export const LABEL_TINGKAT: Record<"dasar" | "menengah" | "mahir", string> = {
  dasar: "Dasar",
  menengah: "Menengah",
  mahir: "Mahir",
};

// ---------- Layar Mulai ----------
export const CONTOH_TUJUAN = [
  "Aku semester 4 Sistem Informasi, pengen jadi Data Analyst tapi belum tahu mulai dari mana.",
  "Aku fresh graduate, mau kerja jadi UI/UX Designer.",
  "Mahasiswa akuntansi semester 5, tertarik pindah ke Data Analyst.",
  "Semester 3, pengen magang jadi Mobile Developer.",
];

/** Pesan penolakan per kategori selain karier_ti. Netral, tidak menghakimi. */
export const PENOLAKAN: Record<Exclude<Intent["kategori"], "karier_ti">, { judul: string; isi: string }> = {
  karier_non_ti: {
    judul: "Careerium khusus untuk karier di bidang TI",
    isi: "Tujuanmu sepertinya di luar TI. Kalau mau, coba cari irisannya: misalnya Data Analyst untuk bidang bisnis atau keuangan, atau UI/UX Designer untuk bidang desain.",
  },
  di_luar_topik: {
    judul: "Itu di luar topik karier",
    isi: "Kira hanya bisa membantu soal karier di bidang TI. Ceritakan posisi yang kamu incar dan tahap kuliahmu sekarang.",
  },
  upaya_manipulasi: {
    judul: "Kalimat itu tidak bisa diproses",
    isi: "Ceritakan tujuan kariermu di bidang TI dengan kalimatmu sendiri, misalnya posisi yang kamu incar.",
  },
  tidak_jelas: {
    judul: "Kira belum menangkap tujuanmu",
    isi: "Coba sebut posisi TI yang kamu incar dan tahap kuliahmu, atau pilih salah satu contoh di bawah.",
  },
};

export const PERTANYAAN_LANJUTAN = "Supaya sarannya pas, apa yang paling kamu cari sekarang?";

export const CATATAN_PERKIRAAN =
  "Posisi ini belum ada di data lowongan kami. Tempel deskripsi lowongan agar hasilnya lebih tepat. Tanpa itu, hasilnya berupa perkiraan umum, bukan data lowongan.";

// ---------- Layar Profil ----------
export const PRIVASI_CV = "CV tidak disimpan. Email, nomor telepon, nama, dan alamat dihapus sebelum diproses.";
export const CV_TIDAK_VALID =
  "Teks ini belum terbaca sebagai CV. Tempel ulang isi CV-mu yang memuat pendidikan, pengalaman, proyek, atau skill.";
export const PDF_GAGAL =
  "PDF ini tidak bisa dibaca (mungkin hasil pindaian gambar). Salin isi CV-mu lalu pakai tab Tempel teks.";

export const TAHAP_LOADING = {
  profil: "Kira sedang membaca CV kamu…",
  gap: "Menghitung gap dengan kebutuhan posisi…",
  roadmap: "Menyusun roadmap 4 minggu…",
} as const;

// ---------- Layar Hasil ----------
export const KETERANGAN_SKOR = "Alat refleksi, bukan penilaian resmi.";

export function sumberLowongan(s: GapResult["sumberLowongan"]): string {
  if (s.perkiraanUmum) return "Perkiraan umum, bukan data lowongan.";
  const posisi = s.posisi_data ? ` ${s.posisi_data}` : "";
  const diakses = s.diakses ? ` (diakses ${formatTanggal(s.diakses)})` : "";
  return `Berdasarkan ${s.jumlah} lowongan${posisi}${diakses}.`;
}

export function sumberGap(jumlahMuncul: number, s: GapResult["sumberLowongan"]): string {
  if (s.perkiraanUmum) return "Perkiraan umum";
  return `Muncul di ${jumlahMuncul} dari ${s.jumlah} lowongan`;
}

/** Kalimat Kira di layar Hasil. Tidak pernah menyebut skor. */
export function kiraHasil(gap: GapResult): string {
  const wajib = gap.gap.find((g) => g.prioritas === "wajib");
  if (wajib) return `Mulai dari "${pendek(wajib.nama)}" dulu, ya. Itu yang paling sering diminta.`;
  if (gap.gap.length > 0) return `Fondasimu sudah ada. Tambah "${pendek(gap.gap[0].nama)}" supaya makin siap.`;
  return "Kebutuhan utama posisi ini sudah kamu punya. Saatnya latihan wawancara!";
}

export const ROADMAP_GAGAL = "Roadmap belum berhasil disusun. Coba susun ulang sebentar lagi.";

function pendek(s: string, max = 40) {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function formatTanggal(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}
