"""Bangun out/lowongan.json dan out/sumber.csv untuk 4 posisi TI:
Web Developer, Data Analyst, UI/UX Designer, Mobile Developer.

Setiap lowongan dikodekan manual ke kelompok skill (bukan menyalin teks lowongan).
Kriteria inklusi: lokasi Indonesia, level magang/junior/fresh graduate atau pengalaman
maks. sekitar 2 tahun (atau tidak disebut), ada daftar skill, diposting sekitar 12 bulan terakhir.
"""
import csv
import os
import json
from collections import Counter

DIAKSES = "2026-11-13"
# Keluaran ke folder data/ (satu tingkat di atas file ini).
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")

# ---------- Kelompok skill ----------
# id: (label, kategori_radar)
GROUPS_WD = {
    "html_css":       ("HTML & CSS", "frontend"),
    "javascript":      ("JavaScript (ES6+)", "frontend"),
    "typescript":      ("TypeScript", "frontend"),
    "fe_framework":    ("Framework frontend (React/Vue/Angular/Next.js/dll.)", "frontend"),
    "css_framework":   ("Framework CSS (Tailwind/Bootstrap)", "frontend"),
    "responsive":      ("Desain web responsif", "frontend"),
    "jquery":          ("jQuery", "frontend"),
    "ui_from_design":  ("Menerjemahkan desain UI (Figma)", "frontend"),
    "be_language":     ("Bahasa/framework backend (PHP/Laravel, Node.js, Python, Go, dll.)", "backend"),
    "rest_api":        ("REST API (membuat/integrasi)", "backend"),
    "auth_security":   ("Autentikasi & keamanan web (JWT, secure coding)", "backend"),
    "mvc_oop":         ("Konsep MVC / OOP", "backend"),
    "sql_db":          ("Database relasional (MySQL/PostgreSQL/SQL Server)", "database"),
    "nosql":           ("Database NoSQL (MongoDB/Redis)", "database"),
    "git":             ("Git & GitHub/GitLab", "tools"),
    "docker":          ("Docker", "tools"),
    "deploy_linux":    ("Deployment, server Linux, CI/CD", "tools"),
    "testing":         ("Software testing (unit/automated)", "tools"),
    "ai_tools":        ("Memakai AI coding tools (ChatGPT, Copilot, Cursor)", "tools"),
    "problem_solving": ("Problem solving & debugging", "profesional"),
    "teamwork_comm":   ("Kerja tim & komunikasi", "profesional"),
    "learning":        ("Kemauan belajar", "profesional"),
    "portfolio":       ("Portofolio / proyek pribadi", "profesional"),
    "english":         ("Bahasa Inggris (dokumentasi teknis)", "profesional"),
}

KAT_WD = {
    "frontend": "Frontend",
    "backend": "Backend",
    "database": "Database",
    "tools": "Tools & DevOps",
    "profesional": "Profesional",
}

# ---------- Lowongan ----------
# req = disebut sebagai syarat; plus = disebut sebagai nilai tambah/diutamakan.
# opsi = teknologi spesifik yang disebut di dalam kelompok.
# kualitas: "lengkap" = daftar kualifikasi terbaca; "sebagian" = hanya cuplikan/tag.
L = []
PREFIX = {"WD": "web_developer", "DA": "data_analyst", "UX": "ui_ux_designer", "MD": "mobile_developer"}

def add(id_, judul, perusahaan, kota, subperan, level, tgl, url, platform, kualitas,
        req, plus=(), opsi=None, catatan=""):
    L.append(dict(posisi=PREFIX[id_[:2]], id=id_, judul=judul, perusahaan=perusahaan, kota=kota, subperan=subperan,
                  level=level, tanggal_posting=tgl, url=url, platform=platform,
                  kualitas=kualitas, req=set(req), plus=set(plus), opsi=opsi or {},
                  catatan=catatan))

FH = "freehire.me (agregator)"

add("WD01", "Frontend Developer (Internship)", "PT Qtera Mandiri", "Jakarta Utara", "frontend", "magang",
    "2026-08-24", "https://freehire.me/jobs/frontend-developer-internship-pt-qtera-mandiri-wptqnrwj", FH, "lengkap",
    req=["fe_framework", "typescript", "css_framework", "responsive", "rest_api", "git", "testing",
         "ai_tools", "teamwork_comm", "learning"],
    plus=["portfolio"], opsi={"fe_framework": ["React"], "css_framework": ["Tailwind"]})
add("WD02", "Backend Developer Intern", "PT Qtera Mandiri", "Jakarta Utara", "backend", "magang",
    "2026-10-05", "https://freehire.me/jobs/backend-developer-intern-pt-qtera-mandiri-t3jirpme", FH, "lengkap",
    req=["be_language", "rest_api", "sql_db", "docker", "git", "teamwork_comm", "ai_tools", "learning", "portfolio"],
    opsi={"be_language": ["Go"], "sql_db": ["PostgreSQL"]})
add("WD03", "IT Web Developer Internship", "Sns.Ac", "Tangerang Selatan", "fullstack", "magang",
    "2026-10-03", "https://freehire.me/jobs/it-web-developer-internship-sns-ac-2r7qlrho", FH, "lengkap",
    req=["be_language", "sql_db", "javascript", "jquery", "html_css", "css_framework", "mvc_oop", "git",
         "problem_solving"],
    plus=["portfolio", "rest_api", "deploy_linux"],
    opsi={"be_language": ["PHP/Laravel"], "sql_db": ["MySQL"], "css_framework": ["Bootstrap"]})
add("WD04", "Fullstack Developer Internship", "Widya Matador", "Sleman (Ngaglik)", "fullstack", "magang",
    "2026-10-12", "https://freehire.me/jobs/fullstack-developer-internship-widya-matador-ddavo7az", FH, "lengkap",
    req=["html_css", "javascript", "fe_framework", "be_language", "sql_db", "nosql", "git", "testing"],
    plus=["rest_api", "docker", "portfolio"],
    opsi={"fe_framework": ["React", "Vue", "Next.js"], "be_language": ["Node.js", "Python", "PHP/Laravel"],
          "sql_db": ["MySQL", "PostgreSQL"], "nosql": ["MongoDB"]})
add("WD05", "Full Stack Developer Intern", "PT Sigma Global Teknologi (via MateCareer)", "Jakarta Barat", "fullstack",
    "magang", "2026-08-25", "https://freehire.me/jobs/full-stack-developer-intern-matecareer-zx3yqf4c", FH, "lengkap",
    req=["html_css", "javascript", "responsive", "fe_framework", "portfolio", "be_language", "rest_api",
         "teamwork_comm", "problem_solving", "learning"],
    opsi={"fe_framework": ["React"], "be_language": ["Python"]})
add("WD06", "Fullstack Developer Intern", "PT Bintang Pitu Global", "Jakarta Selatan", "fullstack", "magang",
    "2026-10-05", "https://freehire.me/jobs/fullstack-developer-intern-pt-bintang-pitu-global-scblogjc", FH, "lengkap",
    req=["html_css", "javascript", "fe_framework", "be_language", "sql_db", "nosql", "rest_api", "git"],
    opsi={"fe_framework": ["React", "Vue", "Angular"], "be_language": ["Node.js", "PHP/Laravel", "Python"],
          "sql_db": ["MySQL", "PostgreSQL"], "nosql": ["MongoDB"]})
add("WD07", "Fullstack Developer Intern", "Rhaya Group", "Bandung", "fullstack", "magang",
    "2026-08-24", "https://freehire.me/jobs/fullstack-developer-intern-rhaya-group-awyvixop", FH, "lengkap",
    req=["javascript", "learning"],
    plus=["portfolio", "fe_framework", "be_language", "sql_db", "git", "deploy_linux", "rest_api"],
    opsi={"fe_framework": ["React", "Next.js"], "be_language": ["Node.js"], "sql_db": ["PostgreSQL"]},
    catatan="Syarat utama hanya JavaScript & CRUD; teknologi lain dari daftar tech stack yang akan dipelajari.")
add("WD08", "Full Stack Developer Internship - Yogyakarta", "Aino Indonesia", "Yogyakarta", "fullstack", "magang",
    "2026-09-23", "https://freehire.me/jobs/full-stack-developer-internship-yogyakarta-aino-indonesia-dhgpiylg", FH,
    "lengkap",
    req=["be_language", "fe_framework", "javascript", "sql_db", "nosql"],
    opsi={"be_language": ["Go", "Node.js", "PHP"], "fe_framework": ["Vue"]})
add("WD09", "Full-Stack Developer Intern (ERPNext Project)", "PT Taharica", "Jakarta Timur", "fullstack", "magang",
    "2026-10-14", "https://freehire.me/jobs/full-stack-developer-intern-erpnext-project-pt-taharica-lrbngbsb", FH,
    "lengkap",
    req=["be_language", "javascript", "html_css", "rest_api", "git", "problem_solving", "learning"],
    opsi={"be_language": ["Python"]})
add("WD10", "Full-Stack Web Developer Intern", "INNOCEAN Indonesia", "Jakarta", "fullstack", "magang",
    "2026-10-26", "https://freehire.me/jobs/full-stack-web-developer-intern-innocean-indonesia-wizqagkk", FH, "lengkap",
    req=["be_language", "fe_framework", "html_css", "sql_db", "deploy_linux", "git", "rest_api"],
    opsi={"be_language": ["PHP/Laravel", "Python"], "fe_framework": ["React", "Vue"], "sql_db": ["PostgreSQL"]})
add("WD11", "Backend Web Development Internship", "KodingData", "Jakarta", "backend", "magang",
    "2026-08-10", "https://freehire.me/jobs/backend-web-development-internship-kodingdata-jhlo7znn", FH, "lengkap",
    req=["rest_api", "auth_security", "english"])
add("WD12", "Full Stack Engineer Intern", "PT Widya Robotics Indonesia", "Sleman", "fullstack", "magang",
    None, "https://freehire.me/jobs/full-stack-engineer-intern-pt-widya-robotics-indonesia-mf5catas", FH, "lengkap",
    req=["fe_framework", "be_language", "rest_api", "sql_db", "nosql"],
    plus=["git", "docker", "deploy_linux"],
    opsi={"fe_framework": ["React", "Vue", "Angular"], "be_language": ["Node.js", "Python", "Go"],
          "sql_db": ["PostgreSQL"], "nosql": ["MongoDB"]},
    catatan="Berlabel magang tetapi mencantumkan pengalaman 1-3 tahun.")
add("WD13", "Jr. Full Stack Developer (Surakarta Based)", "Buzzohero", "Surakarta", "fullstack", "junior",
    "2026-11-12", "https://freehire.me/jobs/jr-full-stack-developer-surakarta-based-buzzohero-p6y4ci7p", FH, "lengkap",
    req=["be_language", "sql_db", "rest_api", "git", "deploy_linux", "responsive", "auth_security",
         "problem_solving", "learning"],
    plus=["ai_tools"],
    opsi={"be_language": ["Node.js", "PHP/Laravel"], "sql_db": ["MySQL", "PostgreSQL"]},
    catatan="Fresh graduate dipersilakan. Tanggal posting perkiraan (tercatat 'kemarin' saat diakses).")
add("WD14", "Junior Full-Stack Developer", "PT Citra Inti Busana Indonesia", "Jakarta Barat", "fullstack", "junior",
    "2026-11-12", "https://freehire.me/jobs/junior-full-stack-developer-pt-citra-inti-busana-indonesia-e35uf5y7", FH,
    "lengkap",
    req=["rest_api", "git", "portfolio", "ai_tools", "problem_solving", "teamwork_comm"],
    catatan="Juga meminta dasar frontend, backend, dan database tanpa menyebut teknologi. Tanggal perkiraan.")
add("WD15", "Junior Frontend Developer", "PT Pusat Gadai Indonesia", "Indonesia", "frontend", "junior",
    "2026-08-29", "https://freehire.me/jobs/junior-frontend-developer-pt-pusat-gadai-indonesia-ddhzsded", FH, "lengkap",
    req=["css_framework", "responsive", "git", "rest_api", "teamwork_comm"],
    opsi={"css_framework": ["Tailwind", "Bootstrap"]},
    catatan="REST API dari syarat pengalaman memakai Postman/Bruno untuk dokumentasi API.")
add("WD16", "Junior Fullstack Developer", "Pengiklan anonim (industri gadai)", "Tangerang Selatan", "fullstack",
    "junior", None, "https://freehire.me/jobs/junior-fullstack-developer-pengiklan-anonim-noef3cwh", FH, "sebagian",
    req=["be_language", "rest_api", "sql_db", "git"], plus=["fe_framework"],
    opsi={"be_language": ["PHP/Laravel", "Go"], "fe_framework": ["React"]})
add("WD17", "Junior Web Developer .Net", "PT Mozaik Bintang Persada", "Indonesia (hybrid)", "fullstack", "junior",
    "2026-09-04", "https://freehire.me/jobs/junior-web-developer-net-pt-mozaik-bintang-persada-eysrtwnz", FH, "lengkap",
    req=["be_language", "mvc_oop", "rest_api", "sql_db", "fe_framework", "git", "english", "problem_solving",
         "teamwork_comm", "learning"],
    plus=["docker", "deploy_linux", "testing", "auth_security"],
    opsi={"be_language": ["C#/.NET"], "sql_db": ["SQL Server"], "fe_framework": ["React", "Vue", "Angular"]})
add("WD18", "Junior Fullstack Developer", "PT Tiga Daya Digital Indonesia (Eksad Technology)", "Indonesia",
    "fullstack", "junior", "2026-09-08",
    "https://freehire.me/jobs/junior-fullstack-developer-pt-tiga-daya-digital-indonesia-eksad-technology-3tsvdzmh", FH,
    "lengkap",
    req=["javascript", "fe_framework", "rest_api", "sql_db", "html_css", "responsive", "git", "problem_solving",
         "teamwork_comm", "learning", "be_language"],
    opsi={"fe_framework": ["Next.js"], "sql_db": ["PostgreSQL"], "be_language": ["Node.js"]})
add("WD19", "Junior Frontend Developer", "PT Inovasi Teknologi Generasi Cemerlang", "Indonesia", "frontend", "junior",
    "2026-08-15",
    "https://freehire.me/jobs/junior-frontend-developer-pt-inovasi-teknologi-generasi-cemerlang-cqybwdva", FH,
    "lengkap",
    req=["fe_framework", "git", "rest_api", "ui_from_design"],
    plus=["typescript", "css_framework"],
    opsi={"fe_framework": ["React", "Vue", "Angular", "Next.js"], "css_framework": ["Tailwind", "Bootstrap"]},
    catatan="Minimal 1 tahun pengalaman.")
add("WD20", "Fullstack Developer", "PT Bentang Inspira Teknologi", "Bandung", "fullstack", "junior",
    "2026-11-12", "https://freehire.me/jobs/fullstack-developer-pt-bentang-inspira-teknologi-bandung-henjdlue", FH,
    "lengkap",
    req=["typescript", "fe_framework", "be_language", "auth_security", "teamwork_comm", "learning"],
    plus=["nosql"],
    opsi={"fe_framework": ["React"], "be_language": ["PHP", "Node.js"], "nosql": ["MongoDB", "Redis"]},
    catatan="Fresh graduate sangat dipersilakan. Tanggal perkiraan.")
add("WD21", "Junior Full-Stack Web Developer", "Auric (remote, terbuka untuk Indonesia)", "Remote (Indonesia)",
    "fullstack", "junior", None, "https://freehire.me/jobs/junior-full-stack-web-developer-auric-c4scx2bm", FH,
    "sebagian",
    req=[], plus=["fe_framework", "typescript", "rest_api", "sql_db", "portfolio", "git"],
    opsi={"fe_framework": ["React", "Next.js"]},
    catatan="Hanya bagian kualifikasi yang diutamakan yang terbaca.")
add("WD22", "Frontend Developer", "Hestara", "Bali (remote)", "frontend", "magang/fresh graduate",
    None, "https://freehire.me/jobs/frontend-developer-hestaraapp-kahywuyg", FH, "lengkap",
    req=["fe_framework", "javascript", "typescript"], plus=["portfolio"],
    opsi={"fe_framework": ["Vue", "Nuxt"]},
    catatan="Untuk mahasiswa atau fresh graduate.")
add("WD23", "Frontend Web Developer | Laravel, REST API, MySQL", "PT Surya Pertiwi Nusantara (TOTO Group)",
    "Jakarta Selatan", "fullstack", "junior", "2026-08-29",
    "https://freehire.me/jobs/frontend-web-developer-laravel-rest-api-mysql-pt-surya-pertiwi-nusantara-toto-group-n27vh4ea",
    FH, "lengkap",
    req=["be_language", "javascript", "sql_db", "git", "ui_from_design", "rest_api"],
    opsi={"be_language": ["PHP/Laravel"], "sql_db": ["MySQL"]},
    catatan="Minimal 1 tahun pengalaman. Judul frontend tetapi syarat mencakup Laravel, jadi dihitung fullstack.")
add("WD24", "Full Stack Developer", "Provices Group", "Jakarta", "fullstack", "junior",
    "2026-11-12", "https://freehire.me/jobs/full-stack-developer-provices-group-l2kdzarl", FH, "lengkap",
    req=["rest_api", "be_language", "html_css", "javascript", "jquery", "sql_db", "deploy_linux", "problem_solving",
         "teamwork_comm"],
    opsi={"be_language": ["PHP/CodeIgniter"], "sql_db": ["MySQL", "SQL Server"]},
    catatan="Minimal 1 tahun, fresh graduate dipersilakan. Juga meminta React Native (mobile). Tanggal perkiraan.")
add("WD25", "Full Stack Developer (Golang, React.js & Next.js)", "Intikom Berlian Mustika", "Jakarta Selatan",
    "fullstack", "junior", None,
    "https://freehire.me/jobs/full-stack-developer-golang-react-js-next-js-intikom-berlian-mustika-wetm2mrj", FH,
    "lengkap",
    req=["be_language", "fe_framework", "typescript", "sql_db", "rest_api", "html_css", "javascript", "responsive",
         "git", "docker"],
    plus=["deploy_linux"],
    opsi={"be_language": ["Go"], "fe_framework": ["React", "Next.js"], "sql_db": ["PostgreSQL"]},
    catatan="Pengalaman 1-2 tahun.")
add("WD26", "Junior Web Programmer (Internship)", "CV. Mediatama Web Indonesia", "Padang", "fullstack", "magang",
    None, "https://karirhub.kemnaker.go.id/lowongan-dalam-negeri/lowongan/5af2d234-c0bf-408e-a130-488f18d7ee95",
    "Karirhub Kemnaker", "sebagian",
    req=["be_language", "javascript", "html_css", "css_framework", "sql_db", "fe_framework", "jquery"],
    opsi={"be_language": ["PHP/Laravel", "Node.js"], "css_framework": ["Bootstrap"], "sql_db": ["MySQL"],
          "fe_framework": ["React"]},
    catatan="Halaman tercatat 'diposting 8 bulan yang lalu'; dibaca dari cuplikan hasil pencarian.")
add("WD27", "Frontend Engineer Intern", "Dealls", "Yogyakarta", "frontend", "magang",
    None, "https://id.indeed.com/q-junior-front-end-lowongan.html", "Indeed (cuplikan)", "sebagian",
    req=["fe_framework", "typescript"], opsi={"fe_framework": ["Next.js", "React"]},
    catatan="Hanya cuplikan tugas dari halaman daftar Indeed.")
add("WD28", "Front End Engineer Intern", "Luxehouze", "Jakarta", "frontend", "magang",
    "2026-06-09",
    "https://www.jobleads.com/id/job/front-end-engineer-intern--daerah-khusus-ibukota-jakarta--ef477d7840356f817693792d0d1ded175",
    "JobLeads (cuplikan)", "sebagian",
    req=["javascript", "typescript", "fe_framework", "css_framework", "responsive"],
    opsi={"fe_framework": ["Svelte", "React", "Next.js"], "css_framework": ["Tailwind"]})
add("WD29", "Front-end Developer Internship", "Media Icon", "Jakarta Timur", "frontend", "magang",
    None, "https://id.indeed.com/q-junior-front-end-lowongan.html", "Indeed (cuplikan)", "sebagian",
    req=["javascript", "html_css"], plus=["fe_framework"], opsi={"fe_framework": ["React", "Vue"]},
    catatan="Untuk mahasiswa semester akhir.")
add("WD30", "Frontend Engineer (Frontend Developer Intern)", "Lezenda / Dukung Gerak Digital", "Medan", "frontend",
    "magang/fresh graduate", "2026-09-21",
    "https://freehire.me/jobs/frontend-engineer-dukung-gerak-digital-6jqfibah", FH, "lengkap",
    req=["git", "javascript", "fe_framework", "html_css", "problem_solving", "css_framework", "learning", "english"],
    opsi={"fe_framework": ["Vue", "React"], "css_framework": ["Tailwind"]},
    catatan="Meminta kemampuan menyiapkan proyek frontend tanpa bantuan AI.")
add("WD31", "Fullstack Developer (Paid Internship)", "PT Tirtamas Coldstorindo Logistik", "Surabaya", "fullstack",
    "magang", "2026-10-21",
    "https://freehire.me/jobs/fullstack-developer-paid-internship-pt-tirtamas-coldstorindo-logistik-yl2htngl", FH,
    "lengkap",
    req=[], plus=["fe_framework", "be_language", "sql_db", "ai_tools", "rest_api", "git", "docker", "deploy_linux"],
    opsi={"fe_framework": ["React", "Next.js"], "be_language": ["Node.js", "Go"], "sql_db": ["PostgreSQL"]},
    catatan="Yang terbaca hanya bagian kualifikasi yang diutamakan.")
add("WD32", "Backend Engineer Project Intern", "TikTok Shop by Tokopedia (via agregator)", "Jawa", "backend",
    "magang", "2026-08-24",
    "https://freehire.me/jobs/backend-engineer-project-intern-start-asap-iaas-lc-vd3g6bxu", FH, "lengkap",
    req=["be_language", "sql_db", "problem_solving"], plus=["fe_framework"],
    opsi={"be_language": ["Go"], "fe_framework": ["React"]},
    catatan="Lowongan yang sama muncul beberapa kali di agregator; dihitung sekali.")
add("WD33", "Backend Engineer (posisi Junior)", "PT Sejin Sky Systems", "Tangerang", "backend", "junior",
    None, "https://freehire.me/jobs/backend-engineer-iot-saas-digital-payment-platform-pt-sejin-sky-systems-kvzrwp4v",
    FH, "lengkap",
    req=["be_language", "rest_api", "portfolio"],
    opsi={"be_language": ["Node.js", "Go", "Java", "Python", "PHP/Laravel", "C#/.NET"]},
    catatan="Fresh graduate dengan portofolio/pengalaman magang dipersilakan untuk posisi junior.")
add("WD34", "Backend Developer", "PT Ketiara Aliran Rezeki", "Medan", "backend", "junior",
    None, "https://freehire.me/jobs/backend-developer-pt-ketiara-aliran-rezeki-4vyaday2", FH, "lengkap",
    req=["be_language", "rest_api", "sql_db", "git", "deploy_linux", "auth_security", "problem_solving"],
    opsi={"be_language": ["PHP/Laravel", "Node.js"], "sql_db": ["MySQL", "PostgreSQL"]},
    catatan="Pengalaman 1-2 tahun.")
add("WD35", "Full Stack Developer - React & JS", "Cari", "Bandung Barat", "fullstack", "fresh graduate",
    None, "https://freehire.me/jobs/full-stack-developer-react-js-specialist-bandung-cari-weurcz35", FH, "sebagian",
    req=["javascript", "fe_framework"], opsi={"fe_framework": ["React"]},
    catatan="Terbuka untuk fresh graduate dari semua jurusan.")

# =====================================================================
# DATA ANALYST
# =====================================================================
GROUPS_DA = {
    "sql":             ("SQL (query data, mis. MySQL/BigQuery)", "query"),
    "python_r":        ("Python atau R untuk analisis (pandas, dll.)", "query"),
    "data_pipeline":   ("Pipeline data / ETL / data warehouse", "query"),
    "git":             ("Git", "query"),
    "spreadsheet":     ("Excel / Google Sheets (pivot, lookup, dashboard)", "spreadsheet"),
    "bi_viz":          ("Visualisasi & BI (Power BI/Tableau/Looker Studio/Metabase)", "visualisasi"),
    "statistics":      ("Statistika & forecasting", "analisis"),
    "data_cleaning":   ("Data cleaning & validasi data", "analisis"),
    "business":        ("Pemahaman bisnis & proses", "analisis"),
    "problem_solving": ("Problem solving & berpikir analitis", "profesional"),
    "detail":          ("Teliti / detail-oriented", "profesional"),
    "teamwork_comm":   ("Kerja tim & komunikasi", "profesional"),
    "learning":        ("Kemauan belajar", "profesional"),
    "portfolio":       ("Portofolio / sertifikasi data", "profesional"),
    "english":         ("Bahasa Inggris", "profesional"),
}
KAT_DA = {
    "query": "Query & pemrograman",
    "spreadsheet": "Spreadsheet",
    "visualisasi": "Visualisasi & BI",
    "analisis": "Analisis",
    "profesional": "Profesional",
}

def fh(slug):
    return "https://freehire.me/jobs/" + slug

add("DA01", "Data Analyst Intern", "Segari", "Banten", "data_analyst", "magang",
    "2026-08-10", fh("data-analyst-intern-segari-mzn6kv6p"), FH, "lengkap",
    req=["sql", "python_r", "bi_viz", "spreadsheet", "data_pipeline", "problem_solving", "teamwork_comm",
         "business"],
    plus=["portfolio"], opsi={"spreadsheet": ["Google Sheets"]},
    catatan="Bootcamp/sertifikasi data analytics jadi nilai tambah; juga menyebut platform cloud (AWS/GCP).")
add("DA02", "Data Analyst Intern", "PT Link Net Tbk", "Jakarta Selatan", "data_analyst", "magang",
    "2026-09-09", fh("data-analyst-intern-pt-link-net-tbk-3abqga46"), FH, "lengkap",
    req=["sql", "python_r", "spreadsheet", "data_cleaning", "detail", "teamwork_comm", "learning"],
    plus=["bi_viz"], opsi={"spreadsheet": ["Excel"], "bi_viz": ["Tableau", "Power BI"]})
add("DA03", "Data Analyst Intern (ERPNext Project)", "PT Taharica", "Jakarta Timur", "data_analyst", "magang",
    None, fh("data-analyst-intern-erpnext-project-pt-taharica-yg4glcod"), FH, "lengkap",
    req=["sql", "spreadsheet", "detail", "teamwork_comm", "learning"],
    plus=["bi_viz", "python_r"],
    opsi={"spreadsheet": ["Excel", "Google Sheets"], "bi_viz": ["Power BI", "Tableau", "Metabase"],
          "python_r": ["Python"], "sql": ["MySQL/MariaDB"]})
add("DA04", "Jr. Data Analyst", "PT Global Loket Sejahtera", "Indonesia", "data_analyst", "junior/fresh graduate",
    None, fh("jr-data-analyst-pt-global-loket-sejahtera-a3cjmals"), FH, "lengkap",
    req=["sql", "python_r", "bi_viz", "statistics"],
    opsi={"python_r": ["Python", "R"], "bi_viz": ["Looker Studio", "Power BI", "Tableau", "Metabase"]},
    catatan="Fresh graduate dipersilakan. SQL disebut wajib; Metabase sebagai nilai tambah.")
add("DA05", "Data Analyst Intern", "Dentsu (Dentsu Aegis Network)", "Jakarta", "data_analyst", "magang",
    "2026-08-10", fh("data-analyst-intern-dentsu-aegis-network-ltd-vd4xfyht"), FH, "lengkap",
    req=["statistics", "data_cleaning", "teamwork_comm", "english", "learning"],
    plus=["spreadsheet", "sql", "python_r", "bi_viz"],
    opsi={"python_r": ["Python", "R"]},
    catatan="Komunikasi dalam bahasa Inggris dan Indonesia.")
add("DA06", "Data Analyst", "CV Green Mile Indonesia", "Surabaya", "data_analyst", "fresh graduate",
    "2026-09-22", fh("data-analyst-cv-green-mile-indonesia-dsafblxq"), FH, "lengkap",
    req=["python_r", "spreadsheet", "sql", "bi_viz", "teamwork_comm", "learning"],
    opsi={"python_r": ["Python", "R"], "spreadsheet": ["Excel"],
          "bi_viz": ["Tableau", "Power BI", "Looker Studio"]})
add("DA07", "Junior Data Analyst", "Sany Perkasa", "Jakarta Barat", "data_analyst", "junior",
    "2026-09-15", fh("junior-data-analyst-sany-perkasa-j7jf2xuf"), FH, "lengkap",
    req=["portfolio", "sql", "bi_viz", "teamwork_comm"], plus=["python_r"],
    opsi={"bi_viz": ["Tableau", "Power BI"]},
    catatan="Meminta sertifikasi data analyst. Syaratnya Python atau SQL; dikodekan SQL syarat, Python nilai tambah.")
add("DA08", "Data Analyst", "Nusantara Sakti Group", "Jakarta Barat", "data_analyst", "junior",
    "2026-09-25", fh("data-analyst-nusantara-sakti-group-cl65xpgt"), FH, "lengkap",
    req=["spreadsheet", "problem_solving", "statistics", "teamwork_comm", "business"],
    plus=["sql", "bi_viz"], opsi={"spreadsheet": ["Excel"], "bi_viz": ["Power BI", "Tableau"]},
    catatan="Pengalaman 1-3 tahun, fresh graduate dipersilakan. Statistika di sini berupa forecasting.")
add("DA09", "Data Analyst Intern - Data Payments", "GoTo Group", "Jakarta", "data_analyst", "magang",
    "2026-10-22", fh("data-analyst-intern-data-payments-goto-group-c5kaolz6"), FH, "lengkap",
    req=["sql", "spreadsheet", "python_r", "bi_viz", "detail"],
    opsi={"python_r": ["Python", "R"], "bi_viz": ["Tableau", "Power BI", "Looker Studio"]})
add("DA10", "Data Analyst Intern - Lending Ops", "GoTo Group", "Jakarta", "data_analyst", "magang",
    "2026-09-03", fh("data-analyst-intern-goto-group-qjiw2rce"), FH, "lengkap",
    req=["spreadsheet", "learning", "teamwork_comm", "problem_solving", "detail"],
    opsi={"spreadsheet": ["Excel"]})
add("DA11", "Data Analyst Intern", "Hangry", "Jakarta", "data_analyst", "magang",
    "2026-08-10", fh("data-analyst-intern-hangry-5mmbuadd"), FH, "lengkap",
    req=["spreadsheet", "sql", "bi_viz", "data_cleaning", "problem_solving", "teamwork_comm", "detail", "learning"],
    opsi={"sql": ["BigQuery"], "bi_viz": ["Looker Studio"], "spreadsheet": ["Google Sheets"]},
    catatan="Looker Studio dan BigQuery disebut di uraian tugas.")
add("DA12", "HCBP Data Analyst Internship", "BFI Finance Indonesia", "Tangerang", "data_analyst", "magang",
    None, fh("hcbp-data-analyst-internship-bfi-finance-indonesia-ncvsspme"), FH, "lengkap",
    req=["spreadsheet"], plus=["bi_viz"],
    opsi={"spreadsheet": ["Excel", "Google Sheets"], "bi_viz": ["Looker Studio"]},
    catatan="Spreadsheet tingkat lanjut (pivot, xlookup) untuk analisis data SDM.")
add("DA13", "Business Process & Data Analyst Intern", "Wismilak", "Surabaya", "data_analyst", "magang",
    None, fh("lowongan-kerja-business-process-data-analyst-intern-wismilak-uxdi7y3o"), FH, "lengkap",
    req=["spreadsheet", "data_cleaning", "bi_viz", "business"], plus=["sql"],
    catatan="Pendaftaran ditutup 2026-10-18; tanggal posting tidak tercatat. Business = pemetaan proses bisnis.")
add("DA14", "Data Analyst", "Astro Indonesia", "Jakarta Barat", "data_analyst", "junior",
    None, fh("data-analyst-astro-indonesia-ct5f4cpp"), FH, "lengkap",
    req=["sql", "python_r", "statistics", "bi_viz"], plus=["git", "data_pipeline"],
    opsi={"sql": ["BigQuery"], "python_r": ["Python"], "bi_viz": ["Looker Studio"],
          "data_pipeline": ["Airflow"]},
    catatan="Pengalaman 1-3 tahun.")
add("DA15", "Junior Data Analyst", "PT YHS Indonesia", "Indonesia", "data_analyst", "junior",
    "2026-08-10", fh("junior-data-analyst-pt-yhs-indonesia-t6romcfe"), FH, "sebagian",
    req=["spreadsheet", "data_cleaning"], opsi={"spreadsheet": ["Excel"]})

# =====================================================================
# UI/UX DESIGNER
# =====================================================================
GROUPS_UX = {
    "wireframe_proto": ("Wireframe, user flow, mockup & prototype", "desain_ui"),
    "design_system":   ("Design system & komponen UI", "desain_ui"),
    "responsive":      ("Desain responsif / mobile-first", "desain_ui"),
    "accessibility":   ("Aksesibilitas (a11y)", "desain_ui"),
    "ux_principles":   ("Prinsip UX, user-centered design & design thinking", "riset_ux"),
    "user_research":   ("Riset pengguna & usability testing", "riset_ux"),
    "design_tool":     ("Tool desain UI (Figma/Adobe XD/Sketch)", "tools"),
    "graphic_tools":   ("Tool grafis (Photoshop/Illustrator)", "tools"),
    "html_css":        ("Dasar HTML/CSS/JavaScript", "tools"),
    "ai_tools":        ("AI tools untuk desain", "tools"),
    "product_collab":  ("Kolaborasi produk (PRD, handoff ke developer)", "profesional"),
    "problem_solving": ("Problem solving & berpikir analitis", "profesional"),
    "detail":          ("Teliti / detail-oriented", "profesional"),
    "teamwork_comm":   ("Kerja tim & komunikasi", "profesional"),
    "learning":        ("Kemauan belajar & menerima feedback", "profesional"),
    "portfolio":       ("Portofolio desain", "profesional"),
}
KAT_UX = {
    "desain_ui": "Desain UI",
    "riset_ux": "Riset & UX",
    "tools": "Tools",
    "profesional": "Profesional",
}

add("UX01", "UI & UX Designer Intern", "Talent Insider", "Jakarta Utara", "ui_ux", "magang",
    None, fh("ui-and-ux-designer-intern-talent-insider-rxcbjtba"), FH, "lengkap",
    req=["portfolio", "html_css", "design_tool"],
    opsi={"design_tool": ["Figma", "Sketch", "Adobe XD"]},
    catatan="Pengalaman kurang dari 1 tahun.")
add("UX02", "Product Design Intern", "PT Otto Menara Globalindo", "Jakarta/Surabaya", "ui_ux", "magang",
    "2026-10-19", fh("product-design-intern-pt-otto-menara-globalindo-qwncp7nw"), FH, "lengkap",
    req=["design_tool", "ux_principles", "problem_solving", "detail", "teamwork_comm"],
    plus=["user_research"], opsi={"design_tool": ["Figma"]},
    catatan="Prinsip UX mencakup UX laws, Gestalt, dan heuristik. Riset & usability testing dari uraian tugas, "
            "dicatat sebagai nilai tambah.")
add("UX03", "IT - UI/UX", "APM Logistics", "Tangerang Selatan", "ui_ux", "junior",
    None, fh("it-ui-ux-apm-logistics-r4uv3qha"), FH, "lengkap",
    req=["design_tool", "ux_principles", "wireframe_proto", "design_system", "user_research", "teamwork_comm"],
    plus=["portfolio"], opsi={"design_tool": ["Figma", "Adobe XD"]},
    catatan="Pengalaman 1 tahun. Riset = analisis kebutuhan pengguna.")
add("UX04", "UI UX Designer", "Talent Insider", "Jakarta Utara", "ui_ux", "junior",
    None, fh("ui-ux-designer-talent-insider-jnokdicw"), FH, "lengkap",
    req=["portfolio", "design_tool", "ux_principles"],
    opsi={"design_tool": ["Adobe XD", "Sketch", "Figma"]},
    catatan="Pengalaman 1-2 tahun.")
add("UX05", "UI/UX Designer", "Daya Wira Performa", "Jakarta", "ui_ux", "junior",
    None, fh("ui-ux-designer-daya-wira-performa-7yehuovi"), FH, "sebagian",
    req=["design_tool", "design_system", "user_research"], plus=["ai_tools"],
    opsi={"design_tool": ["Figma"]},
    catatan="Pengalaman 1+ tahun. Hanya sebagian kualifikasi yang terbaca.")
add("UX06", "UI/UX Design", "PT Bintang Pitu Global", "Jakarta", "ui_ux", "magang/fresh graduate",
    None, "", "Indeed (cuplikan)", "lengkap",
    req=["design_tool", "ux_principles", "wireframe_proto", "user_research", "responsive", "accessibility",
         "portfolio", "teamwork_comm"],
    opsi={"design_tool": ["Figma"]},
    catatan="Pengalaman jadi nilai tambah, bukan syarat. URL halaman tidak tersimpan; dibaca dari Indeed.")
add("UX07", "UI UX Designer (Magang)", "Papandayan Cargo", "Indonesia", "ui_ux", "magang",
    None, "https://dealls.com/en/loker/ui-ux-designer-3~papandayan-cargo", "Dealls", "lengkap",
    req=["design_tool", "wireframe_proto", "responsive", "portfolio", "learning"],
    plus=["user_research", "design_system"],
    opsi={"design_tool": ["Figma", "Sketch", "Adobe XD", "Canva"]},
    catatan="Riset dan design system dari uraian tugas, dicatat sebagai nilai tambah.")
add("UX08", "UI/UX Designer (Magang)", "recodex.id", "Remote", "ui_ux", "magang",
    None, "https://recodex.id/karir/uiux-designer", "Situs karier perusahaan", "lengkap",
    req=["user_research", "wireframe_proto", "design_tool", "design_system", "ux_principles", "accessibility",
         "portfolio", "learning"],
    opsi={"design_tool": ["Figma"]},
    catatan="Figma disebut wajib.")
add("UX09", "Intern Product Designer (UI/UX)", "bitbybit", "Jakarta (hybrid)", "ui_ux", "magang",
    None, "https://bitbybit.studio/careers/intern-product-designer-ui-ux/", "Situs karier perusahaan", "lengkap",
    req=["design_tool", "responsive", "wireframe_proto", "ai_tools", "design_system", "product_collab"],
    opsi={"design_tool": ["Figma"]},
    catatan="Figma tingkat lanjut (komponen, auto layout, variants); alur desain-ke-kode berbantuan AI; "
            "menulis PRD.")
add("UX10", "Product Designer Intern", "PT Telkomsel Ekosistem Digital (INDICO)", "Jakarta Selatan", "ui_ux",
    "magang", "2026-08-31", "https://apply.workable.com/indico/jobs/view/4567B41BAF.md", "Workable",
    "sebagian",
    req=["portfolio", "design_tool"], plus=["wireframe_proto"],
    opsi={"design_tool": ["Figma"]},
    catatan="Portofolio wajib; tool prototyping lain jadi nilai tambah.")
add("UX11", "UI/UX Designer Intern", "Iyagi", "Jakarta (remote)", "ui_ux", "magang",
    "2026-10-23", "https://app.semesteria.com/jobs/ui-ux-designer-intern-remote-iyagi-f0097989-f638-4929-bb28-8c3d946ed645",
    "Semesteria", "sebagian",
    req=["design_tool", "ux_principles", "teamwork_comm", "learning"],
    opsi={"design_tool": ["Figma", "Adobe XD"]},
    catatan="Tanggal perkiraan (tercatat '3 minggu lalu' saat diakses).")
add("UX12", "UI/UX Designer Intern (Paid)", "Ukirama", "Jakarta (Sudirman)", "ui_ux", "magang",
    "2026-11-09", "https://dealls.com/en/loker/uiux-designer-intern-paid~ukirama", "Dealls", "sebagian",
    req=["portfolio", "learning"],
    catatan="Portofolio proyek akademik/pribadi; bersedia menerima feedback. Tanggal perkiraan ('4 hari lalu').")
add("UX13", "UI/UX Designer", "PT Mandiri International Technology", "Jakarta Selatan", "ui_ux", "junior",
    "2026-11-12", "https://dealls.com/loker/uiux-designer-9~pt-mandiri-international-technology", "Dealls",
    "lengkap",
    req=["graphic_tools", "wireframe_proto", "ux_principles", "responsive"], plus=["html_css"],
    opsi={"graphic_tools": ["Photoshop", "Illustrator"]},
    catatan="Pengalaman 1-3 tahun; memahami alur perbankan. Tanggal perkiraan (rekruter aktif saat diakses).")
add("UX14", "UI/UX Designer Internship", "Synapsis.id", "Indonesia", "ui_ux", "magang",
    None, "https://recruitment.synapsis.id/ui-ux-designer-internship", "Situs karier perusahaan", "sebagian",
    req=["wireframe_proto", "learning"],
    catatan="Hanya uraian tugas dan sikap (proaktif, mengikuti tren desain) yang terbaca.")

# =====================================================================
# MOBILE DEVELOPER
# =====================================================================
GROUPS_MD = {
    "mobile_framework": ("Framework/bahasa mobile (Flutter, React Native, Kotlin, Swift)", "pengembangan"),
    "prog_fundamental": ("Dasar pemrograman & OOP", "pengembangan"),
    "ui_impl":          ("Implementasi UI dari desain & layout responsif", "pengembangan"),
    "rest_api":         ("Integrasi REST API & JSON", "integrasi"),
    "firebase":         ("Firebase / backend-as-a-service", "integrasi"),
    "local_db":         ("Penyimpanan lokal (SQLite, secure storage)", "integrasi"),
    "auth":             ("Autentikasi & otorisasi", "integrasi"),
    "state_mgmt":       ("State management (Provider/BLoC/Redux)", "arsitektur"),
    "architecture":     ("Arsitektur aplikasi (MVVM/Clean Architecture/design pattern)", "arsitektur"),
    "testing_debug":    ("Testing & debugging", "arsitektur"),
    "git":              ("Git & GitHub", "tools"),
    "build_release":    ("Build & rilis ke Play Store/App Store, CI/CD", "tools"),
    "ide_sdk":          ("Android Studio / VS Code & Android SDK", "tools"),
    "ai_tools":         ("Memakai AI coding tools", "tools"),
    "problem_solving":  ("Problem solving", "profesional"),
    "detail":           ("Teliti / detail-oriented", "profesional"),
    "teamwork_comm":    ("Kerja tim & komunikasi", "profesional"),
    "learning":         ("Kemauan belajar", "profesional"),
    "portfolio":        ("Portofolio / aplikasi yang pernah dibuat", "profesional"),
    "english":          ("Bahasa Inggris", "profesional"),
}
KAT_MD = {
    "pengembangan": "Pengembangan aplikasi",
    "integrasi": "Integrasi & data",
    "arsitektur": "Arsitektur & kualitas",
    "tools": "Tools & rilis",
    "profesional": "Profesional",
}

add("MD01", "Internship - Mobile Developer", "PT Qansa Solusi Indonesia", "Medan", "mobile", "magang",
    "2026-10-08", fh("internship-mobile-developer-pt-qansa-solusi-indonesia-teqxyub4"), FH, "lengkap",
    req=["prog_fundamental", "detail", "learning"],
    plus=["mobile_framework", "git", "portfolio"],
    opsi={"mobile_framework": ["Flutter", "React Native", "Kotlin", "Java"]},
    catatan="Framework mobile, Git, dan portofolio disebut sebagai nilai plus.")
add("MD02", "ICT Mobile Developer Staff", "Maybank Indonesia", "Jakarta Pusat", "mobile", "fresh graduate",
    None, fh("ict-mobile-developer-staff-maybank-emgtdjyb"), FH, "sebagian",
    req=["mobile_framework", "git", "testing_debug"],
    opsi={"mobile_framework": ["Flutter", "React Native"]},
    catatan="Terbuka untuk fresh graduate (S1, IPK min. 2,75). Kontrak.")
add("MD03", "React Native Developer (Junior)", "Finshot, Inc.", "Jakarta", "mobile", "junior",
    "2026-09-22", fh("react-native-developer-junior-finshot-inc-73qhhbtf"), FH, "lengkap",
    req=["mobile_framework", "state_mgmt", "rest_api", "build_release"],
    plus=["ai_tools", "english"],
    opsi={"mobile_framework": ["React Native"]},
    catatan="Minimal 1 tahun React Native CLI; juga meminta TypeScript/JavaScript dan integrasi native module.")
add("MD04", "Mobile Developer (Flutter)", "Prohire Global (klien)", "Jakarta", "mobile", "junior",
    None, fh("mobile-developer-prohire-global-crioylpj"), FH, "lengkap",
    req=["mobile_framework", "state_mgmt", "architecture", "rest_api", "local_db", "git"],
    opsi={"mobile_framework": ["Flutter"], "state_mgmt": ["BLoC"], "local_db": ["SQLite"]},
    catatan="Kontrak 1 tahun; pengalaman 1-2 tahun.")
add("MD05", "Mobile Apps Developer Staff", "Global Indonesia Asia Sejahtera", "Jakarta Utara", "mobile", "staff",
    None, fh("mobile-apps-developer-staff-global-indonesia-asia-sejahtera-ihq4amhk"), FH, "lengkap",
    req=["mobile_framework", "prog_fundamental", "rest_api", "git", "architecture", "testing_debug",
         "build_release", "problem_solving", "teamwork_comm"],
    plus=["firebase"],
    opsi={"mobile_framework": ["Flutter", "React Native", "Kotlin", "Swift"]},
    catatan="Meminta pengalaman tanpa menyebut jumlah tahun. CI/CD jadi nilai tambah.")
add("MD06", "Mobile Developer (Android)", "Goodeva Technology", "Bekasi Selatan", "mobile", "junior",
    None, fh("mobile-developer-goodeva-technology-chl27vyk"), FH, "lengkap",
    req=["mobile_framework", "ide_sdk", "ui_impl", "architecture", "rest_api"],
    plus=["git", "testing_debug"],
    opsi={"mobile_framework": ["Kotlin", "Java"], "ui_impl": ["Jetpack Compose", "XML"]},
    catatan="Java nilai tambah. Git dan unit testing dari daftar skill lowongan. Jumlah tahun pengalaman tidak disebut.")
add("MD07", "Flutter Developer", "Wirehire (klien)", "Jakarta", "mobile", "junior",
    None, fh("flutter-developer-wirehire-il35tmw4"), FH, "lengkap",
    req=["mobile_framework", "ui_impl", "state_mgmt", "testing_debug", "rest_api", "ide_sdk", "git"],
    opsi={"mobile_framework": ["Flutter"], "state_mgmt": ["setState", "Provider"]},
    catatan="Jumlah tahun pengalaman tidak disebut.")
add("MD08", "Mobile Application Programmer (Flutter)", "Endo Indonesia", "Surabaya", "mobile", "junior",
    None, fh("mobile-aplicant-programmer-flutter-endo-indonesia-2ys4wk67"), FH, "lengkap",
    req=["rest_api", "ui_impl", "mobile_framework", "detail"],
    opsi={"mobile_framework": ["Flutter"]},
    catatan="Pengalaman diutamakan, bukan syarat. UI = memahami konsep UI dan UX.")
add("MD09", "Android Developer", "PT Appfuxion Consulting Indonesia", "Jakarta", "mobile", "junior",
    "2026-10-26", fh("android-developer-pt-appfuxion-consulting-indonesia-f7aklygb"), FH, "lengkap",
    req=["mobile_framework", "ide_sdk", "teamwork_comm"],
    opsi={"mobile_framework": ["Java", "Kotlin", "C++"]},
    catatan="Pengalaman sebagai Android developer jadi nilai tambah.")
add("MD10", "Flutter Developer", "PT Cashlez Worldwide Indonesia", "Jakarta Pusat", "mobile", "junior",
    "2026-10-11", fh("flutter-developer-cashlez-worldwide-indonesia-ofufjarw"), FH, "lengkap",
    req=["mobile_framework", "architecture", "rest_api", "git", "ui_impl", "testing_debug", "firebase",
         "problem_solving", "detail", "teamwork_comm"],
    plus=["portfolio"],
    opsi={"mobile_framework": ["Flutter"]},
    catatan="Meminta pengalaman Flutter tanpa menyebut jumlah tahun. Portofolio dilampirkan saat melamar.")
add("MD11", "Mobile Application Developer", "SCCR Indonesia (Agung Putra University)", "Gunungpati, Semarang",
    "mobile", "junior", "2026-10-17", fh("mobile-application-developer-sccr-indonesia-yg6lu5uj"), FH, "lengkap",
    req=["mobile_framework", "portfolio", "rest_api", "state_mgmt", "auth", "git", "testing_debug", "ui_impl",
         "build_release", "problem_solving", "teamwork_comm", "learning"],
    plus=["firebase", "local_db", "architecture"],
    opsi={"mobile_framework": ["Flutter", "React Native"]},
    catatan="Syarat: pengalaman 3 tahun ATAU portofolio proyek yang kuat, jadi masih terbuka untuk lulusan baru "
            "berportofolio.")

# ---------- Hitung ----------
POSISI = [
    {"id": "web_developer", "nama": "Web Developer", "groups": GROUPS_WD, "kategori": KAT_WD,
     "cakupan": "Magang, junior, dan fresh graduate (pengalaman maks. sekitar 2 tahun) di Indonesia; "
                "peran frontend, backend, dan fullstack web.",
     "subperan": ("frontend", "backend", "fullstack")},
    {"id": "data_analyst", "nama": "Data Analyst", "groups": GROUPS_DA, "kategori": KAT_DA,
     "cakupan": "Magang, junior, dan fresh graduate data analyst di Indonesia (termasuk peran analis data "
                "di tim bisnis/operasional/SDM).", "subperan": ()},
    {"id": "ui_ux_designer", "nama": "UI/UX Designer", "groups": GROUPS_UX, "kategori": KAT_UX,
     "cakupan": "Magang, junior, dan fresh graduate UI/UX atau product designer di Indonesia.", "subperan": ()},
    {"id": "mobile_developer", "nama": "Mobile Developer", "groups": GROUPS_MD, "kategori": KAT_MD,
     "cakupan": "Magang, junior, dan fresh graduate mobile developer (Flutter, React Native, Android native) "
                "di Indonesia; termasuk lowongan yang tidak menyebut jumlah tahun pengalaman.", "subperan": ()},
]

def prioritas(pct):
    return "wajib" if pct >= 60 else ("penting" if pct >= 30 else "nilai_tambah")

def ringkas(lowongan, groups):
    n = len(lowongan)
    muncul, sebagai_syarat = Counter(), Counter()
    opsi_count = {g: Counter() for g in groups}
    for x in lowongan:
        for g in x["req"] | x["plus"]:
            assert g in groups, (x["id"], g)
            muncul[g] += 1
        for g in x["req"]:
            sebagai_syarat[g] += 1
        for g, ops in x["opsi"].items():
            assert g in groups, (x["id"], g)
            for o in ops:
                if o.startswith("PHP"):
                    # Gabungkan varian PHP; framework yang disebut dicatat terpisah
                    opsi_count[g]["PHP"] += 1
                    if "/" in o:
                        opsi_count[g]["__fw__" + o.split("/")[1]] += 1
                else:
                    opsi_count[g][o] += 1
    skills = []
    for g, (label, kat) in groups.items():
        m = muncul[g]
        if m == 0:
            continue
        pct = round(m / n * 100)
        item = {
            "id": g, "nama": label, "kategori_radar": kat,
            "jumlah_muncul": m, "persen_muncul": pct,
            "jumlah_sebagai_syarat": sebagai_syarat[g],
            "prioritas": prioritas(pct),
        }
        if opsi_count[g]:
            fw = {k[6:]: v for k, v in opsi_count[g].items() if k.startswith("__fw__")}
            ops = []
            for k, v in opsi_count[g].most_common():
                if k.startswith("__fw__"):
                    continue
                o = {"nama": k, "jumlah": v}
                if k == "PHP" and fw:
                    o["framework_disebut"] = fw
                ops.append(o)
            item["opsi_teknologi"] = ops
        skills.append(item)
    skills.sort(key=lambda s: (-s["jumlah_muncul"], s["nama"]))
    return n, skills

ids = [x["id"] for x in L]
assert len(ids) == len(set(ids)), "ID lowongan ganda"

out_posisi = []
for p in POSISI:
    part = [x for x in L if x["posisi"] == p["id"]]
    n, skills = ringkas(part, p["groups"])
    entry = {
        "id": p["id"], "nama": p["nama"], "cakupan": p["cakupan"],
        "jumlah_lowongan": n,
        "jumlah_data_lengkap": sum(1 for x in part if x["kualitas"] == "lengkap"),
        "kategori_radar": p["kategori"],
    }
    if p["subperan"]:
        sub = {}
        for sp in p["subperan"]:
            sp_part = [x for x in part if x["subperan"] == sp]
            sn, ss = ringkas(sp_part, p["groups"])
            sub[sp] = {"jumlah_lowongan": sn,
                       "skill_teratas": [{"id": s["id"], "persen_muncul": s["persen_muncul"]} for s in ss[:6]]}
        entry["rincian_subperan"] = sub
    entry["skill"] = skills
    entry["sumber"] = {"file": "sumber.csv", "tanggal_akses": DIAKSES,
                       "platform": sorted({x["platform"] for x in part})}
    out_posisi.append(entry)
    p["_n"], p["_skills"] = n, skills

data = {
    "versi": 2,
    "diperbarui": DIAKSES,
    "aturan_prioritas": "persen_muncul >= 60 -> wajib; 30-59 -> penting; < 30 -> nilai_tambah",
    "catatan_umum": [
        "Satu lowongan bisa menyebut beberapa pilihan teknologi (mis. React atau Vue); kelompok skill dihitung "
        "sekali per lowongan, dan rincian pilihan ada di opsi_teknologi.",
        "jumlah_muncul menggabungkan syarat dan nilai tambah; jumlah_sebagai_syarat hanya syarat.",
        "Kategori radar berbeda per posisi; lihat kategori_radar di tiap posisi.",
        "Sebagian besar lowongan sudah ditutup saat diakses; data dipakai untuk melihat pola kebutuhan skill, "
        "bukan daftar lowongan aktif.",
        "Jumlah sampel kecil (11-35 lowongan per posisi); persentase adalah gambaran, bukan statistik pasar.",
    ],
    "posisi": out_posisi,
}

with open(os.path.join(OUT, "lowongan.json"), "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open(os.path.join(OUT, "sumber.csv"), "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["id", "posisi", "judul", "perusahaan", "kota", "subperan", "level", "tanggal_posting",
                "tanggal_akses", "platform", "kualitas_data", "skill_syarat", "skill_nilai_tambah", "url", "catatan"])
    for x in L:
        w.writerow([x["id"], x["posisi"], x["judul"], x["perusahaan"], x["kota"], x["subperan"], x["level"],
                    x["tanggal_posting"] or "", DIAKSES, x["platform"], x["kualitas"],
                    "; ".join(sorted(x["req"])), "; ".join(sorted(x["plus"])), x["url"], x["catatan"]])

for p in POSISI:
    print(f'\n== {p["nama"]}: {p["_n"]} lowongan')
    for s in p["_skills"]:
        print(f'{s["persen_muncul"]:>3}%  {s["jumlah_muncul"]:>2}  syarat {s["jumlah_sebagai_syarat"]:>2}  '
              f'{s["prioritas"]:<12} {s["nama"]}'
              + ("  [" + ", ".join(f'{o["nama"]} {o["jumlah"]}' for o in s.get("opsi_teknologi", [])) + "]"
                 if s.get("opsi_teknologi") else ""))
