import { FormData, praktikPedagogisOptions, lingkunganOptions, durasiJP, alokasiWaktu } from "@/lib/constants";

function calcSessionMinutes(formData: FormData): { menitPerSesi: number; jpPerKegiatan: number; jpPerSesi: number; totalJP: number; jmlKegiatan: number; jmlPertemuan: number; menitPerJP: number } | null {
  const waktuStr = formData.waktu || (() => {
    if (!formData.jenjang || !formData.kelas) return "";
    const jp = alokasiWaktu[formData.jenjang]?.[formData.kelas];
    return jp ? `${jp} JP / Tahun` : "";
  })();
  const match = waktuStr.match(/(\d+)/);
  const totalJP = match ? parseInt(match[1], 10) : 0;
  const jmlKegiatan = parseInt(formData.jumlahKegiatan, 10);
  const jmlPertemuan = parseInt(formData.jumlahPertemuan, 10);
  const menitPerJP = durasiJP[formData.jenjang] || 0;
  if (!totalJP || !jmlKegiatan || !jmlPertemuan || !menitPerJP) return null;
  const jpPerKegiatan = totalJP / jmlKegiatan;
  const jpPerSesi = jpPerKegiatan / jmlPertemuan;
  const menitPerSesi = Math.round(jpPerSesi * menitPerJP);
  return { menitPerSesi, jpPerKegiatan, jpPerSesi, totalJP, jmlKegiatan, jmlPertemuan, menitPerJP };
}

export function buildModulPrompt(formData: FormData): { prompt: string; systemPrompt: string } {
  const praktikLabel = praktikPedagogisOptions.find(p => p.value === formData.praktikPedagogis)?.label || formData.praktikPedagogis;
  const lingkunganLabel = lingkunganOptions.find(l => l.value === formData.lingkungan)?.label || formData.lingkungan;
  const temaDisplay = formData.tema === "Tema Lainnya (Konteks Lokal)" && formData.temaLokal
    ? formData.temaLokal : formData.tema;

  const dimensiText = Object.entries(formData.dimensi || {})
    .map(([dim, inds]) => `- ${dim}: ${inds.join("; ")}`)
    .join("\n");

  const calc = calcSessionMinutes(formData);

  const waktuContext = calc
    ? `- Alokasi Waktu Total: ${calc.totalJP} JP/Tahun (dibagi ${calc.jmlKegiatan} kegiatan × ${calc.jmlPertemuan} pertemuan = ${calc.jpPerSesi.toFixed(1)} JP/sesi ≈ ${calc.menitPerSesi} menit/sesi)
- DURASI SESI INI: ~${calc.menitPerSesi} menit. Gunakan durasi ini untuk membagi waktu di langkahDetail: Pendahuluan ~${Math.round(calc.menitPerSesi * 0.15)} menit, Kegiatan Inti ~${Math.round(calc.menitPerSesi * 0.7)} menit, Penutup ~${Math.round(calc.menitPerSesi * 0.15)} menit.`
    : `- Alokasi Waktu Total: ${formData.waktu || "(belum diisi)"} (PENTING: Ini adalah total JP per TAHUN AJARAN, BUKAN untuk satu kegiatan. Bagi waktu secara proporsional untuk satu sesi kegiatan, misalnya Pendahuluan 15-20 menit, Kegiatan Inti 45-90 menit, Penutup 15-20 menit.)`;

  const systemPrompt = `Kamu adalah ahli kurikulum pendidikan Indonesia yang sangat berpengalaman dalam merancang modul kegiatan Ko-Kurikuler sesuai Kurikulum Merdeka dan Panduan Kemdikbud 2024. Berikan respons dalam Bahasa Indonesia yang formal dan profesional. PENTING: Respons HARUS berupa JSON valid tanpa markdown code blocks.`;

  const prompt = `Buatkan konten modul kegiatan Ko-Kurikuler dengan detail berikut:

INFORMASI KEGIATAN:
- Sekolah: ${formData.sekolah || "(belum diisi)"}
- Jenjang: ${formData.jenjang || "(belum diisi)"}
- Fase: ${formData.fase || "(belum diisi)"}
- Kelas: ${formData.kelas || "(belum diisi)"}
- Tema: ${temaDisplay || "(belum diisi)"}
- Judul Kegiatan: ${formData.judul}
- Bentuk Kegiatan: ${formData.jenis}${formData.jenisLain ? ` (${formData.jenisLain})` : ""}
${formData.detail7kaih?.length > 0 ? `- Detail 7KAIH: ${formData.detail7kaih.join(", ")}` : ""}
${formData.lintasMapel ? `- Lintas Mapel: ${formData.lintasMapel}` : ""}
- Praktik Pedagogis: ${praktikLabel || "(belum dipilih)"}
- Lingkungan Belajar: ${lingkunganLabel || "(belum dipilih)"}
${formData.jenisAktivitas?.length > 0 ? `- Jenis Aktivitas: ${formData.jenisAktivitas.join(", ")}` : ""}
${formData.digital?.length > 0 ? `- Teknologi Digital: ${formData.digital.join(", ")}` : ""}
${formData.kemitraan?.length > 0 ? `- Kemitraan: ${formData.kemitraan.join(", ")}` : ""}
${formData.asesmenFormatif?.length > 0 ? `- Asesmen Formatif: ${formData.asesmenFormatif.join(", ")}` : ""}
${formData.asesmenSumatif?.length > 0 ? `- Asesmen Sumatif: ${formData.asesmenSumatif.join(", ")}` : ""}
- Lokasi: ${formData.lokasi?.length > 0 ? formData.lokasi.join(", ") : "(belum dipilih)"}
${waktuContext}
- Rencana Waktu: ${formData.rencanaWaktu || "(belum diisi)"}

DIMENSI PROFIL LULUSAN YANG DIPILIH:
${dimensiText || "(belum ada)"}

INSTRUKSI:
Buat konten modul yang MENDALAM, KONTEKSTUAL, dan SPESIFIK terhadap judul "${formData.judul}" dan tema "${temaDisplay}". Jangan hanya membuat poin-poin generik — buat konten yang benar-benar relevan dan bisa langsung dipakai guru.

Respons HARUS berupa JSON dengan struktur PERSIS seperti ini (tanpa markdown code blocks):
{
  "tujuan": ["(3-5 tujuan pembelajaran spesifik dan terukur, sesuai dimensi yang dipilih)"],
  "lingkunganDesc": "(deskripsi 2-3 kalimat tentang lingkungan belajar yang digunakan)",
  "praktikPedagogisDesc": "(deskripsi 2-3 kalimat tentang praktik pedagogis yang diterapkan)",
  "langkahDetail": [
    {"title": "Tahap 1: Pendahuluan (... menit)", "items": ["(langkah detail dan spesifik)", "..."]},
    {"title": "Tahap 2: Kegiatan Inti (... menit)", "items": ["(langkah detail dan spesifik)", "..."]},
    {"title": "Tahap 3: Penutup (... menit)", "items": ["(langkah detail dan spesifik)", "..."]}
  ],
  "instruksiLKPD": [
    {"step": "Langkah 1", "detail": "(instruksi spesifik untuk siswa)"},
    {"step": "Langkah 2", "detail": "(instruksi spesifik untuk siswa)"},
    {"step": "Langkah 3", "detail": "(instruksi spesifik untuk siswa)"}
  ],
  "soalUraian": ["(3-5 soal uraian yang menguji pemahaman mendalam, relevan dengan judul kegiatan)"],
  "articles": [
    {"type": "article", "title": "(judul bahan bacaan relevan)", "points": ["(poin-poin penting)", "..."], "source": "(sumber referensi)"}
  ]
}`;

  return { prompt, systemPrompt };
}
