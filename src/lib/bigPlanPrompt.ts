import type { SchoolContext } from "./bigPlanConstants";
import { themeOptions, dimensiData } from "./constants";

export function buildBigPlanPrompt(ctx: SchoolContext): { prompt: string; systemPrompt: string } {
  const themeList = themeOptions.filter(t => t !== "Tema Lainnya (Konteks Lokal)").join(", ");
  const dimensiList = Object.keys(dimensiData).join(", ");

  const systemPrompt = `Kamu adalah ahli kurikulum pendidikan Indonesia yang sangat berpengalaman dalam merancang Program Tahunan Kokurikuler sesuai Kurikulum Merdeka dan Panduan Kemdikbud 2024. Berikan respons dalam Bahasa Indonesia yang formal dan profesional. PENTING: Respons HARUS berupa JSON valid tanpa markdown code blocks.`;

  const jumlahTema = ctx.jumlahTema > 0 ? ctx.jumlahTema : Math.max(1, Math.round(ctx.totalJP / 25));
  const jpPerTema = Math.floor(ctx.totalJP / jumlahTema);
  const jpSisa = ctx.totalJP - jpPerTema * (jumlahTema - 1);

  const prompt = `Buatkan Program Tahunan Kokurikuler berupa distribusi tema kegiatan untuk satu tahun ajaran.

KONTEKS SEKOLAH:
- Nama Sekolah: ${ctx.sekolah || "(belum diisi)"}
- Jenjang: ${ctx.jenjang}
- Fase: ${ctx.fase}
- Kelas: ${ctx.kelas}
- Tahun Ajaran: ${ctx.tahunAjaran || "(belum diisi)"}
- Total JP per Tahun: ${ctx.totalJP} JP
- Kondisi Geografis: ${ctx.geografis || "(belum diisi)"}
- Potensi Ekonomi Lingkungan: ${ctx.ekonomi?.length > 0 ? ctx.ekonomi.join(", ") : "(belum diisi)"}
- Karakteristik Sosial & Budaya: ${ctx.sosialBudaya || "(belum diisi)"}

TEMA RESMI KEMDIKBUD: ${themeList}

INSTRUKSI:
1. Buat ${jumlahTema} tema kegiatan yang terdistribusi sepanjang tahun ajaran
2. Pastikan total JP = ${ctx.totalJP} (rekomendasi: ${jumlahTema - 1} tema × ${jpPerTema} JP + 1 tema utama × ${jpSisa} JP)
3. Tema harus KONTEKSTUAL sesuai kondisi geografis, ekonomi, dan sosial budaya sekolah
4. Gunakan tema resmi Kemdikbud sebagai payung, dengan konteks lokal sebagai pengayaan
5. Distribusikan 8 Dimensi Profil Lulusan secara merata. HANYA gunakan dimensi berikut: ${dimensiList}
6. Variasikan jenis kokurikuler dan bentuk kegiatan

Respons HARUS berupa JSON array dengan struktur PERSIS seperti ini (tanpa markdown code blocks):
[
  {
    "no": 1,
    "kelas": "${ctx.kelas}",
    "dimensi": "(HARUS salah satu dari 8 dimensi profil lulusan, contoh: Kolaborasi, Penalaran Kritis, Kesehatan)",
    "tema": "(tema spesifik kontekstual)",
    "jenisKokurikuler": "(Pembelajaran Kolaboratif / Gerakan 7KAIH / Cara Lainnya)",
    "bentukKegiatan": "(deskripsi kegiatan spesifik sesuai konteks lokal)",
    "mapelTerkait": "(mata pelajaran yang terintegrasi)",
    "alokasiJP": ${jpPerTema}
  }
]

PENTING: Pastikan array memiliki tepat ${jumlahTema} objek dan total alokasiJP = ${ctx.totalJP}.`;

  return { prompt, systemPrompt };
}
