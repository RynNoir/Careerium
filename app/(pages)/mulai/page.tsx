import { Kira, Steps } from "@/components/ui";

// Kerangka sementara (langkah 0.5): isi layar Mulai dibangun di langkah 1.4.
export default function MulaiPage() {
  return (
    <div className="flex flex-col gap-5">
      <Steps aktif={1} />
      <div className="flex items-start justify-between gap-3">
        <h1 className="display">
          Mau jadi <span className="hl">apa</span> di dunia TI?
        </h1>
        <Kira pose="menyapa" size={72} className="shrink-0" />
      </div>
      <p className="max-w-[65ch] text-text-muted">Ceritakan tujuanmu dengan kalimat bebas. Bisa tanpa akun.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" className="btn btn-primary w-full sm:w-auto">
          Pahami tujuanku
        </button>
        <button type="button" className="btn btn-secondary w-full sm:w-auto">
          Coba mode demo
        </button>
      </div>
    </div>
  );
}
