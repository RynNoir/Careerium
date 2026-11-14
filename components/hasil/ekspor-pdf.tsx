"use client";

import { FileDown } from "lucide-react";

/** Ekspor lewat dialog cetak browser ("Simpan sebagai PDF"): tanpa dependensi, tata letak cetak diatur kelas print:. */
export function EksporPdf({ posisi }: { posisi: string }) {
  function cetak() {
    const judul = document.title;
    document.title = `Careerium - Hasil ${posisi}`; // jadi nama file PDF bawaan
    window.addEventListener("afterprint", () => (document.title = judul), { once: true });
    window.print();
  }
  return (
    <button type="button" className="btn btn-secondary w-full sm:w-auto" onClick={cetak}>
      <FileDown className="size-4" aria-hidden="true" /> Simpan sebagai PDF
    </button>
  );
}
