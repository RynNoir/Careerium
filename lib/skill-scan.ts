// Pemindai skill teknis deterministik: melengkapi hasil LLM dengan skill yang TERTULIS di CV tapi terlewat.
// Kamus = nama kelompok + opsi_teknologi dari data/lowongan.json + data/sinonim.json.
// Soft skill tidak dipindai (butuh penilaian konteks oleh LLM).
import data from "@/data/lowongan.json";
import sinonimData from "@/data/sinonim.json";
import { normalizeForMatch } from "./evidence";
import { LowonganFile } from "./lowongan";
import type { Profile } from "./schemas";

type SkillCV = Profile["skills"][number];
type Entri = { alias: string; grup: string; jenis: SkillCV["jenis"] };

const SOFT = new Set(["problem_solving", "teamwork_comm", "learning", "portfolio", "english", "detail", "business", "product_collab"]);
const TOOLS = new Set(["git", "docker", "design_tool", "graphic_tools", "spreadsheet", "bi_viz", "ide_sdk", "ai_tools", "deploy_linux"]);
// Terlalu umum untuk dianggap bukti skill bila berdiri sendiri.
const UMUM = new Set(["api", "database", "testing", "debugging", "dashboard", "deployment", "container", "status", "bahasa"]);
const SINONIM = sinonimData as unknown as Record<string, string[]>;
const BULLET = /^\s*[-•*▪●]\s*/;

const kunci = (s: string) => normalizeForMatch(s).replace(/[^a-z0-9+#]/g, "");
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Hanya alias "bernama teknologi". Isi kurung nama kelompok tidak dipakai (bisa berisi kata umum seperti "membuat").
const KAMUS: Entri[] = (() => {
  const file = LowonganFile.parse(data);
  const seen = new Set<string>();
  const out: Entri[] = [];
  for (const pos of file.posisi) {
    for (const s of pos.skill) {
      if (SOFT.has(s.id)) continue;
      const luar = s.nama.split("(")[0];
      const alias = [
        ...luar.split(/\s+&\s+|\//).map((t) => t.trim()),
        ...(s.opsi_teknologi ?? []).map((o) => o.nama),
        ...(SINONIM[s.id] ?? []),
      ];
      for (const a of alias) {
        const k = kunci(a);
        if (a.length < 3 || UMUM.has(k) || seen.has(k)) continue;
        seen.add(k);
        out.push({ alias: a, grup: s.id, jenis: TOOLS.has(s.id) ? "tools" : "teknis" });
      }
    }
  }
  return out.sort((x, y) => y.alias.length - x.alias.length); // alias panjang dulu ("Tailwind CSS" sebelum "CSS")
})();

const GRUP_DARI_ALIAS = new Map(KAMUS.map((e) => [kunci(e.alias), e.grup]));

/** Tambahkan skill teknis yang tertulis di CV tetapi tidak diekstrak LLM. Bukti = baris CV itu sendiri. */
export function lengkapiSkill(profile: Profile, cvText: string): Profile {
  if (!profile.cv_valid) return profile;
  const ada = new Set(profile.skills.map((s) => kunci(s.nama)));
  // Satu skill per kelompok: kelompok yang sudah diwakili skill dari LLM tidak ditambah lagi.
  const grupAda = new Set(profile.skills.map((s) => GRUP_DARI_ALIAS.get(kunci(s.nama))).filter(Boolean));
  const baris = cvText.split(/\r?\n/);
  const tambahan: SkillCV[] = [];

  for (const e of KAMUS) {
    if (ada.has(kunci(e.alias)) || grupAda.has(e.grup)) continue;
    const re = new RegExp(`(^|[^\\p{L}\\p{N}])(${escape(e.alias)})(?=$|[^\\p{L}\\p{N}])`, "iu");
    // Utamakan baris pengalaman/proyek (poin) sebagai bukti, lalu baris lain.
    const cocok = baris.filter((l) => re.test(l));
    const line = cocok.find((l) => BULLET.test(l)) ?? cocok[0];
    if (!line) continue;
    const kata = line.replace(BULLET, "").trim().split(/\s+/);
    if (kata.length < 2) continue;

    // Aturan tingkat tetap: CV menulis "(dasar)" -> dasar; dipakai di poin pengalaman/proyek -> menengah; selain itu dasar.
    const tulisDasar = new RegExp(`${escape(e.alias)}\\s*\\(dasar\\)`, "i").test(cvText);
    const tingkat: SkillCV["tingkat"] = tulisDasar ? "dasar" : BULLET.test(line) ? "menengah" : "dasar";
    tambahan.push({ nama: line.match(re)![2], jenis: e.jenis, tingkat, bukti: kata.slice(0, 25).join(" ") });
    ada.add(kunci(e.alias));
    grupAda.add(e.grup);
  }
  // Soft skill hanya dari pola kalimat yang jelas di poin pengalaman (bukan dari daftar kata sifat).
  for (const sf of SOFT_POLA) {
    if (sf.alias.some((a) => ada.has(kunci(a)))) continue;
    const line = baris.find((l) => BULLET.test(l) && sf.pola.test(l));
    if (!line) continue;
    tambahan.push({ nama: sf.nama, jenis: "soft_skill", tingkat: "menengah", bukti: line.replace(BULLET, "").trim().split(/\s+/).slice(0, 25).join(" ") });
    for (const a of sf.alias) ada.add(kunci(a));
  }
  return { ...profile, skills: [...profile.skills, ...tambahan].slice(0, 30) };
}

const SOFT_POLA = [
  {
    nama: "Kerja tim",
    alias: ["Kerja tim", "Kerja sama tim", "Teamwork", "Koordinasi tim", "Koordinasi", "Kolaborasi", "Kerja sama"],
    pola: /\b(ber)?koordinasi\b|\bkerja\s*sama\b|\bbekerja\s+(sama|dalam\s+tim)\b|\bkolaborasi\b|\banggota\s+tim\b|\bteamwork\b/i,
  },
  {
    nama: "Kepemimpinan",
    alias: ["Kepemimpinan", "Leadership", "Memimpin"],
    pola: /\bmemimpin\b|\bketua\b|\bkoordinator\b|\bpemimpin\b|\bleader\b/i,
  },
];
