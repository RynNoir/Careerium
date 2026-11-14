// Semua kalimat penolakan, error, dan gelembung Kira dibuat di sini (bukan oleh LLM). CLAUDE.md §4.

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
