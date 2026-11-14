// Validasi bukti kutipan oleh kode (langkah 2.2): kutipan harus benar-benar ada di teks CV.

// Samakan huruf, spasi, tanda kutip, tanda hubung, dan bullet agar beda format tidak menggagalkan.
export function normalizeForMatch(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[‘’‚‛`´]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/[‐-―−]/g, "-")
    .replace(/[•●▪■◦·*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const MIN_PART = 4; // potongan kutipan yang terlalu pendek tidak dianggap bukti

/**
 * true jika kutipan ditemukan di CV. Kutipan boleh dipotong dengan "..." / "…";
 * setiap potongan harus ada di CV dan urutannya sesuai.
 */
export function evidenceInText(quote: string, normalizedCv: string): boolean {
  const parts = normalizeForMatch(quote)
    .split(/\.{3,}|…/)
    .map((p) => p.replace(/^[\s"'.,;:()-]+|[\s"'.,;:()-]+$/g, ""))
    .filter(Boolean);
  if (parts.length === 0 || parts.some((p) => p.length < MIN_PART)) return false;
  let from = 0;
  for (const p of parts) {
    const at = normalizedCv.indexOf(p, from);
    if (at < 0) return false;
    from = at + p.length;
  }
  return true;
}
