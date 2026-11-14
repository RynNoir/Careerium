// Batas panjang input (CLAUDE.md §5). File ini ikut terimpor ke klien lewat schemas.ts: konstanta saja.
export const MAX_GOAL_CHARS = 500;
export const MAX_CV_CHARS = 6000;
export const MAX_ANSWER_CHARS = 1500;
export const MAX_JOB_DESC_CHARS = 4000;

// Kuota permintaan ke endpoint AI per jendela waktu (dipakai lib/quota.ts).
export const LLM_QUOTA_WINDOW_MS = 60 * 60 * 1000; // 1 jam
export const LLM_QUOTA_PER_SESSION = 40; // satu alur lengkap ± 12 permintaan
export const LLM_QUOTA_PER_IP = 300; // longgar: peserta & juri sering berbagi Wi-Fi
