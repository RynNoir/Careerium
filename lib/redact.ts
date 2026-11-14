// Hapus data pribadi dari teks CV di sisi klien SEBELUM dikirim ke server/LLM (CLAUDE.md §5).
// Heuristik sengaja agresif: lebih baik satu baris hilang daripada data pribadi terkirim.

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
// +62 / 62 / 0 diikuti 8–13 digit, boleh dipisah spasi, titik, atau tanda hubung
const TELEPON = /(?:\+?62|\b0)[\s.-]?\(?\d{2,4}\)?(?:[\s.-]?\d{2,5}){2,4}\b/g;
const TAUTAN_PROFIL = /\b(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com|instagram\.com|facebook\.com|wa\.me)\/\S*/gi;
const LABEL_NAMA = /^(\s*(?:nama(?: lengkap)?|name)\s*[:：-]\s*).+$/gim;
const LABEL_ALAMAT = /^(\s*(?:alamat|address|domisili|tempat tinggal)\s*[:：-]\s*).+$/gim;
const BARIS_ALAMAT = /^.*\b(?:jl\.?|jalan|gg\.?|gang|rt\s*\.?\s*\d+|rw\s*\.?\s*\d+|kel\.|kec\.|kelurahan|kecamatan|kode pos)\b.*$/gim;
const LAHIR = /^(\s*(?:tempat,? tanggal lahir|ttl|tanggal lahir)\s*[:：-]\s*).+$/gim;

const BUKAN_NAMA = /^(curriculum vitae|daftar riwayat hidup|riwayat hidup|resume|cv|profil|profile|ringkasan|summary)$/i;

export function redact(text: string): string {
  const t = text
    .replace(EMAIL, "[EMAIL]")
    .replace(TAUTAN_PROFIL, "[TAUTAN]")
    .replace(TELEPON, "[TELEPON]")
    .replace(LABEL_NAMA, "$1[NAMA]")
    .replace(LABEL_ALAMAT, "$1[ALAMAT]")
    .replace(LAHIR, "$1[DIHAPUS]")
    .replace(BARIS_ALAMAT, "[ALAMAT]");

  // Nama biasanya baris pertama CV (atau tepat di bawah judul "Curriculum Vitae"): 2–5 kata, hanya huruf.
  const lines = t.split("\n");
  for (let i = 0, seen = 0; i < lines.length && seen < 2; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    seen++;
    if (BUKAN_NAMA.test(line)) continue;
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 5 && /^[\p{L}.'’\s-]+$/u.test(line)) lines[i] = "[NAMA]";
    break;
  }
  return lines.join("\n");
}
