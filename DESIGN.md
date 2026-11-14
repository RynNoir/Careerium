# DESIGN.md — Careerium

> **Status: BELUM DIKUNCI**
> Gaya visual belum ditentukan. Bagian bertanda `[ISI]` diisi saat sesi develop pertama,
> berdasarkan referensi pengguna atau usulan skill pengarah desain.
> Setelah terisi, ubah status menjadi **DIKUNCI** dan tulis tanggalnya.
> Bagian "Prinsip tetap" berlaku apa pun gaya yang dipilih.

Tanggal dikunci: `[ISI]`
Dikunci oleh: `[ISI]`

---

## 1. Arah gaya

| Item | Nilai |
|---|---|
| Nama arah gaya (satu frasa) | `[ISI]` contoh: "bersih dan hangat", "editorial", "playful" |
| Referensi (tautan/gambar/DESIGN.md sumber) | `[ISI]` |
| Skill pengarah yang dipakai | `[ISI]` Impeccable / UI UX Pro Max |
| Tema | `[ISI]` terang / gelap / keduanya |
| Kesan yang ingin dirasakan pengguna | `[ISI]` |
| Yang harus dihindari dari referensi | `[ISI]` |

Jika referensi berupa DESIGN.md merek lain (Awesome Design), **ambil prinsipnya saja**: jangan menyalin logo, nama merek, atau identitas visual yang khas milik merek itu.

---

## 2. Prinsip tetap (tidak berubah walau gaya berganti)

1. **Memberdayakan, bukan menghakimi.** Skill yang kurang ditampilkan sebagai "perlu ditingkatkan", bukan "gagal". Warna merah hanya untuk error sistem, tidak pernah untuk gap skill.
2. **Mobile-first.** Didesain untuk lebar 360–390 px dulu, lalu diperluas ke desktop.
3. **Satu fokus per layar.** Satu tombol aksi utama per layar.
4. **Transparansi AI.** Kartu konfirmasi bisa diedit, setiap skill punya "Bukti di CV", setiap gap menyebut sumber ("muncul di N dari M lowongan"), dan skor diberi keterangan "alat refleksi, bukan penilaian resmi".
5. **Loading yang menjelaskan.** Tampilkan tahap ("Membaca CV…", "Menghitung gap…", "Menyusun roadmap…") dengan skeleton, bukan spinner kosong.
6. **Error yang menolong.** Setiap pesan error menyebut apa yang bisa dilakukan pengguna berikutnya.
7. **Terbaca di proyektor.** Kontras tinggi dan ukuran chart cukup besar untuk demo di depan juri.

---

## 3. Token warna `[ISI]`

Isi kolom Nilai dengan kode hex. Peran (kolom kiri) jangan diubah, karena kode memakai nama peran ini.

| Peran (nama token) | Dipakai untuk | Nilai terang | Nilai gelap (jika ada) |
|---|---|---|---|
| `bg` | latar halaman | `[ISI]` | `[ISI]` |
| `surface` | kartu, panel | `[ISI]` | `[ISI]` |
| `surface-muted` | latar sub-blok di dalam kartu | `[ISI]` | `[ISI]` |
| `border` | garis dan pemisah | `[ISI]` | `[ISI]` |
| `text` | teks utama | `[ISI]` | `[ISI]` |
| `text-muted` | teks sekunder | `[ISI]` | `[ISI]` |
| `primary` | tombol utama, tautan, progres | `[ISI]` | `[ISI]` |
| `primary-fg` | teks di atas `primary` | `[ISI]` | `[ISI]` |
| `primary-soft` | chip, latar terpilih | `[ISI]` | `[ISI]` |
| `gap` | skill yang perlu ditingkatkan (aksen hangat, BUKAN merah) | `[ISI]` | `[ISI]` |
| `gap-soft` | latar item gap | `[ISI]` | `[ISI]` |
| `success` | kekuatan, selesai | `[ISI]` | `[ISI]` |
| `error` | error sistem saja | `[ISI]` | `[ISI]` |
| `chart-user` | data "skill kamu" di chart | `[ISI]` | `[ISI]` |
| `chart-target` | data "kebutuhan posisi" di chart | `[ISI]` | `[ISI]` |

Aturan warna:
- Kontras teks minimal **4,5:1** (teks besar ≥24 px minimal 3:1). Cek setiap pasangan teks dan latar.
- `chart-user` dan `chart-target` harus berbeda dalam **kecerahan**, bukan hanya warna, dan salah satunya bergaris putus-putus.
- Hindari gradien ungu-biru generik "aplikasi AI" kecuali referensi memang memintanya.

Implementasi: token ini menjadi CSS variables di `app/globals.css` dan dipetakan ke tema Tailwind/shadcn. Komponen tidak boleh memakai hex langsung.

---

## 4. Tipografi `[ISI]`

| Peran | Font | Ukuran / tinggi baris | Tebal |
|---|---|---|---|
| Display (judul layar) | `[ISI]` | `[ISI]` | `[ISI]` |
| H2 (judul kartu) | `[ISI]` | `[ISI]` | `[ISI]` |
| Body | `[ISI]` | `[ISI]` (minimal 15 px di ponsel) | `[ISI]` |
| Small / label | `[ISI]` | `[ISI]` (minimal 12 px) | `[ISI]` |
| Angka skor | `[ISI]` | `[ISI]` | `[ISI]` |

- Maksimal 2 keluarga font, dimuat lewat `next/font`.
- Font harus mendukung karakter Bahasa Indonesia dengan baik dan gratis (Google Fonts atau sejenisnya).

---

## 5. Spasi, radius, bayangan, gerak `[ISI]`

| Token | Nilai |
|---|---|
| Satuan spasi dasar | `[ISI]` contoh: 4 px atau 8 px |
| Padding halaman (ponsel) | `[ISI]` |
| Jarak antar kartu | `[ISI]` |
| Radius kartu | `[ISI]` |
| Radius tombol / input | `[ISI]` |
| Radius chip | `[ISI]` |
| Bayangan kartu | `[ISI]` |
| Durasi animasi | `[ISI]` (disarankan 150–300 ms) |

Aturan tetap:
- Target sentuh minimal **44×44 px**.
- Animasi seperlunya: radar menggambar masuk, angka skor menghitung naik, transisi antar pertanyaan. Hormati `prefers-reduced-motion`.

---

## 6. Komponen

Setiap komponen memakai token di atas. Gaya visual mengikuti arah gaya; struktur dan perilakunya tetap.

| Komponen | Struktur dan perilaku (tetap) | Catatan gaya `[ISI]` |
|---|---|---|
| Tombol utama | Satu per layar, lebar penuh di ponsel, label kata kerja | |
| Tombol sekunder | Garis tepi, untuk aksi alternatif ("Ubah", "Coba jawab ulang") | |
| Chip contoh kalimat | Bisa diklik, mengisi kolom tujuan | |
| Chip konfirmasi | Bisa diedit, ikon pensil, `aria-label` jelas | |
| Kartu | Judul + isi; tanpa garis tepi kiri berwarna | |
| Cincin skor | Angka besar di tengah + keterangan "alat refleksi" | |
| Radar chart | 5 sumbu, legenda di bawah, `aria-label` berisi semua nilai | |
| Item kekuatan | Nama skill, tingkat, "Bukti di CV" yang bisa dibuka (`<details>`) | |
| Item gap | Nama skill, jumlah lowongan sumber, lencana prioritas | |
| Lencana prioritas | Wajib (paling menonjol), Penting, Nilai tambah. Bedakan juga lewat teks, bukan warna saja | |
| Item roadmap | Kotak centang, label minggu, fokus, mini-proyek | |
| Gelembung chat | AI di kiri, pengguna di kanan, label gap asal pertanyaan | |
| Kartu umpan balik | Skor total, 4 bar rubrik, checklist STAR, saran perbaikan | |
| Penanda progres | Langkah alur (Tujuan, Profil, Hasil) dan wawancara (n/5) | |
| Skeleton loading | Mengikuti bentuk konten yang akan muncul + teks tahap | |
| Pesan penolakan / error | Ikon + kalimat ramah + saran tindakan + contoh yang bisa diklik | |

---

## 7. Pola layar

Mockup awal (sebagai acuan alur dan isi, bukan gaya): kanvas "Careerium – Mockup UI".

1. **Mulai:** penanda 3 langkah, judul, kolom tujuan ketik bebas, chip contoh, kartu konfirmasi (Ya, lanjut / Ubah), tautan mode demo, keterangan "bisa tanpa akun".
2. **Profil:** pilihan tempel teks CV atau unggah PDF, keterangan privasi ("CV tidak disimpan, data pribadi dihapus sebelum diproses").
3. **Hasil:** cincin skor + keterangan, radar chart, Kekuatan (dengan bukti), Perlu ditingkatkan (dengan sumber dan prioritas), Roadmap 4 minggu, tombol menempel di bawah "Mulai latihan wawancara".
4. **Wawancara:** penanda n/5, pertanyaan dengan label gap asal, jawaban, kartu umpan balik, perbandingan dengan percobaan sebelumnya, input jawaban menempel di bawah.
5. **Riwayat:** linimasa analisis dan grafik skor wawancara antar percobaan.
6. **Masuk / Daftar / Lupa password:** email + password; setelah daftar, kode pemulihan ditampilkan sekali dengan tombol salin dan peringatan untuk menyimpannya.

Desktop (≥1024 px): konten maksimal ~1100 px di tengah; layar Hasil boleh dua kolom (skor + radar di kiri, daftar di kanan).

---

## 8. Visualisasi data

- Radar chart: maksimal 5–6 sumbu, label dibaca horizontal.
- Setiap chart punya legenda teks dan `aria-label` yang memuat angka.
- Jangan menampilkan angka yang tidak berasal dari data (`scoring.ts` atau `lowongan.json`).

---

## 9. Bahasa dan konten

- Bahasa Indonesia, sapaan "kamu", kalimat pendek.
- Label tombol berupa kata kerja: "Pahami tujuanku", "Ya, lanjut", "Mulai latihan wawancara".
- Hindari jargon tanpa penjelasan; istilah seperti STAR diberi keterangan singkat.
- Tanpa emoji di antarmuka; pakai ikon Lucide.

---

## 10. Aksesibilitas (checklist)

- [ ] Elemen interaktif memakai `<button>`, `<a>`, `<input>` + `<label>` asli.
- [ ] Tombol ikon punya `aria-label`.
- [ ] Kontras teks lolos 4,5:1.
- [ ] Informasi tidak hanya dibedakan lewat warna.
- [ ] Fokus keyboard terlihat jelas.
- [ ] `prefers-reduced-motion` dihormati.
- [ ] `lang="id"` di elemen `<html>`.

---

## 11. Larangan

- Gradien generik "aplikasi AI", kartu dengan garis tepi kiri berwarna, emoji sebagai ikon.
- Merah untuk gap skill.
- Lorem ipsum atau angka karangan di UI produksi.
- Status bar ponsel palsu di layar aplikasi.
- Menyalin identitas visual merek lain secara utuh.

---

## 12. Cara mengisi file ini (untuk sesi develop pertama)

Contoh perintah di Claude Code:

> Baca CLAUDE.md dan DESIGN.md. Pakai skill [Impeccable / UI UX Pro Max] untuk mengusulkan 3 arah gaya Careerium berdasarkan referensi ini: [tautan/gambar]. Setelah saya memilih satu, isi semua bagian `[ISI]` di DESIGN.md, cek kontras setiap pasangan warna, lalu ubah status menjadi DIKUNCI. Jangan membuat layar sebelum DESIGN.md dikunci.

Setelah dikunci: terapkan token ke `app/globals.css` dan tema Tailwind/shadcn, lalu bangun layar sesuai bagian 7.
