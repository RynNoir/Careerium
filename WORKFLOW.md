# WORKFLOW.md — Alur kerja tim Careerium

Tim: **1 Backend (BE)** dan **1 Frontend (FE)**.
Tujuan file ini: keduanya bisa bekerja paralel tanpa saling menunggu, dan merge ke `main` hampir tidak pernah conflict.

Dokumen terkait: `PRD.md` (apa yang dibangun), `CLAUDE.md` (aturan teknis & agen AI), `DESIGN.md` (gaya visual).

**Urutan kerja:** `docs/alur-fitur.md`. Setiap fitur dikerjakan estafet: BE membuat endpoint → serah terima → FE membuat layar dan menyambungkannya. FE selalu satu fitur di belakang BE, jadi keduanya tetap bekerja bersamaan.

---

## 1. Prinsip anti-conflict

1. **Setiap file punya satu pemilik.** Hanya pemilik yang mengedit. Yang lain meminta lewat TODO-nya sendiri (lihat §5).
2. **Setiap orang hanya mengedit TODO miliknya.** BE → `docs/todo/backend.md`, FE → `docs/todo/frontend.md`.
3. **Kontrak dulu, kode belakangan.** FE dan BE hanya bertemu di `lib/schemas.ts`. FE memakai data mock yang mengikuti skema itu sampai endpoint siap.
4. **Branch pendek, merge sering.** Satu branch = satu tugas kecil, umurnya beberapa jam, bukan seharian.
5. **File bersama diubah dalam commit tersendiri** dan segera di-merge ke `main` (lihat §4).

---

## 2. Peta kepemilikan file

| Path | Pemilik | Catatan |
|---|---|---|
| `app/api/**` | BE | Semua route handler |
| `lib/db.ts`, `lib/auth-core.ts`, `lib/session.ts`, `lib/http.ts` | BE | Ubah `auth-core.ts` → wajib `npm run test:smoke` |
| `lib/llm.ts`, `lib/prompts/**`, `lib/scoring.ts`, `lib/limits.ts` | BE | |
| `lib/schemas.ts` | **BE (kontrak bersama)** | FE mengusulkan, BE yang mengedit. Ikuti §4 |
| `db/**`, `scripts/**` | BE | |
| `data/**` (`lowongan.json`, `demo/rani.json`) | BE | |
| `app/(pages)/**`, `app/page.tsx`, `app/layout.tsx` | FE | Semua halaman |
| `app/globals.css`, `components/**`, `hooks/**` | FE | Token dari `DESIGN.md` |
| `lib/redact.ts`, `lib/pdf.ts`, `lib/api-client.ts`, `lib/pesan-template.ts` | FE | Kode sisi klien, teks template UI |
| `mocks/**` | FE | Data contoh sesuai `lib/schemas.ts` |
| `DESIGN.md` | FE | |
| `docs/todo/backend.md` | BE | |
| `docs/todo/frontend.md` | FE | |
| `package.json`, `package-lock.json` | **Bersama** | Ikuti §4 |
| `PRD.md`, `CLAUDE.md`, `WORKFLOW.md`, `.env.example`, `next.config.ts` | **Bersama** | Ubah hanya setelah sepakat, commit tersendiri |

File baru: masuk ke folder milik track-mu. Jika ragu, tanyakan dulu sebelum membuat.

---

## 3. Branch dan siklus kerja harian

```
main  ← selalu bisa di-deploy (terhubung ke Vercel)
 ├─ be/<fitur>   contoh: be/llm-fallback, be/intent, be/scoring
 └─ fe/<fitur>   contoh: fe/layar-mulai, fe/kartu-konfirmasi, fe/hasil-radar
```

### Mulai tugas
```bash
git switch main
git pull
git switch -c be/intent          # atau fe/layar-mulai
```

### Selama bekerja
- Commit kecil-kecil, format Conventional Commits (CLAUDE.md §9), file disebut spesifik (bukan `git add .`).
- Centang tugas di TODO milikmu pada commit yang sama dengan kodenya.

### Selesai tugas (merge ke main)
```bash
git switch main
git pull                          # ambil perubahan partner
git switch be/intent
git merge main                    # selesaikan conflict di branch-mu, BUKAN di main
npm run typecheck && npm run lint # wajib lolos
git switch main
git merge --no-ff be/intent
git push
git branch -d be/intent
```
Jika repo di GitHub, boleh lewat Pull Request; partner cukup melihat sekilas, tidak perlu review mendalam.

### Ritme
- Merge ke `main` **minimal setiap 1–2 jam** atau setiap satu tugas selesai.
- Sebelum mulai tugas baru: selalu `git pull` di `main`.
- **Checkpoint (C1–C4, PRD §18):** BE merge dulu, lalu FE merge dan menyambungkan ke endpoint asli. Cek URL Vercel bersama.

---

## 4. Mengubah file bersama

### `lib/schemas.ts` (kontrak API)
1. FE yang butuh perubahan menulis permintaannya di bagian **"Butuh dari backend"** di `docs/todo/frontend.md`, dan memberi tahu langsung lewat chat.
2. BE mengubah skema di branch `be/kontrak-<nama>`, **hanya file `lib/schemas.ts`** (dan route yang terdampak bila perlu).
3. BE mencatat perubahan di tabel **"Log kontrak"** di `docs/todo/backend.md`.
4. Langsung merge ke `main`, lalu beri tahu FE: "kontrak berubah, silakan pull".
5. FE menjalankan `git pull` lalu `git merge main` ke branch-nya, dan memperbaiki mock jika `npm run typecheck` gagal.

Perubahan yang **menghapus/mengganti nama field** wajib disepakati dulu. Menambah field opsional boleh langsung.

### `package.json` / `package-lock.json`
- Satu dependensi baru = satu commit tersendiri: `chore(config): tambah dependensi <nama>`. Segera merge ke `main` dan beri tahu partner untuk `npm install`.
- Jika `package-lock.json` conflict: **jangan diedit manual.**
  ```bash
  git checkout --theirs package-lock.json   # ambil versi main
  npm install                                # menyusun ulang lock dengan dependensimu
  git add package.json package-lock.json
  ```
  `package.json` tetap diselesaikan manual (gabungkan kedua daftar dependensi).

### Dokumen bersama (`PRD.md`, `CLAUDE.md`, `WORKFLOW.md`)
Ubah setelah sepakat lewat chat, commit tersendiri dengan tipe `docs`, segera merge.

---

## 5. Komunikasi lewat TODO

Setiap TODO punya bagian yang sama:

| Bagian | Isi |
|---|---|
| Sedang dikerjakan | Nomor langkah yang sedang dikerjakan, agar partner tahu posisimu |
| Langkah per fitur | Kotak centang dengan nomor langkah dari `docs/alur-fitur.md` (contoh: 1.3), mudah disebut di chat |
| Butuh dari track lain | Permintaan ke partner. Partner **membaca** tapi **tidak mengedit**; ia menjawab dengan mengerjakan lalu memberi tahu |
| Catatan / blocker | Hal yang menghambat, keputusan kecil |

Khusus `docs/todo/backend.md` ada:
- **Status endpoint**: `mock` → `siap lokal` → `siap Vercel`. FE melihat tabel ini untuk tahu kapan berhenti memakai mock.
- **Log kontrak**: riwayat perubahan `lib/schemas.ts`.

---

## 6. Frontend tanpa menunggu backend

- Mock disimpan di `mocks/` dengan tipe dari `lib/schemas.ts`, contoh:
  ```ts
  import type { Intent } from "@/lib/schemas";
  export const intentRani: Intent = { kategori: "karier_ti", tujuan: "magang", /* ... */ };
  ```
  Karena bertipe, `npm run typecheck` langsung memberi tahu jika kontrak berubah.
- Semua `fetch` ke API lewat satu file `lib/api-client.ts`. Peralihan mock → API asli cukup diubah di file itu (per fungsi), tidak tersebar di halaman.
- Setelah endpoint berstatus `siap lokal`, FE menyambungkannya dan menghapus pemakaian mock untuk endpoint itu (mock tetap disimpan untuk mode demo/pengujian).

---

## 7. Aturan untuk agen AI (Claude Code, Cursor, dll.)

Setiap anggota memakai agen di laptop masing-masing. Saat memulai sesi, beri tahu agen track-mu, contoh:
> "Saya di track **Frontend**. Baca CLAUDE.md, DESIGN.md, WORKFLOW.md, docs/alur-fitur.md, dan docs/todo/frontend.md. Kerjakan langkah 1.4."

Agen wajib:
- Hanya mengedit file milik track tersebut (§2). Butuh mengubah file milik track lain → berhenti dan tulis permintaan di bagian "Butuh dari ..." pada TODO track sendiri.
- Tidak mengubah `lib/schemas.ts` dari track FE.
- Mengubah dependensi hanya dalam commit tersendiri (§4).
- Mencentang tugas di TODO track sendiri setelah selesai dan teruji.
- Tetap mematuhi aturan git di CLAUDE.md §9: **tidak menjalankan commit/merge/push**, hanya memberikan perintahnya.

---

## 8. Checklist sebelum merge ke `main`

- [ ] `git merge main` sudah dijalankan di branch, conflict selesai di branch.
- [ ] `npm run typecheck` dan `npm run lint` lolos.
- [ ] Jika menyentuh auth: `npm run test:smoke` lolos.
- [ ] Tidak ada `.env*` (selain `.env.example`), `*.db`, atau kunci API di commit.
- [ ] TODO milikmu sudah diperbarui.
- [ ] Jika mengubah kontrak/dependensi: partner sudah diberi tahu.
