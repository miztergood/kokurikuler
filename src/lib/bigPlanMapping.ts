import type { BigPlanTheme, SchoolContext } from "@/lib/bigPlanConstants";
import type { FormData } from "@/lib/constants";
import {
  dimensiData,
  themeOptions,
  jenisOptions,
  jenisAktivitasOptions,
  praktikPedagogisOptions,
  lingkunganOptions,
  digitalTools,
  kemitraanOptions,
  asesmenFormatifOptions,
  asesmenSumatifOptions,
  lokasiOptions,
} from "@/lib/constants";

/**
 * Maps a Big Plan theme + school context into a partial FormData
 * that auto-fills checkboxes and dropdowns in the module form.
 */
export function mapBigPlanToFormData(
  theme: BigPlanTheme,
  context: SchoolContext
): Partial<FormData> {
  const result: Partial<FormData> = {};

  // === 1. Basic text fields ===
  result.sekolah = context.sekolah;
  result.jenjang = context.jenjang;
  result.fase = context.fase;
  result.kelas = context.kelas;
  result.tahunAjaran = context.tahunAjaran;
  result.lintasMapel = theme.mapelTerkait || "";
  result.judul = theme.bentukKegiatan || "";
  result.waktu = theme.alokasiJP ? String(theme.alokasiJP) : "";

  // === 2. Tema — match to official options or fallback to "Tema Lainnya" ===
  const matchedTema = themeOptions.find((opt) =>
    theme.tema.toLowerCase().includes(opt.toLowerCase().slice(0, 10)) ||
    opt.toLowerCase().includes(theme.tema.toLowerCase().slice(0, 10))
  );
  if (matchedTema && matchedTema !== "Tema Lainnya (Konteks Lokal)") {
    result.tema = matchedTema;
  } else {
    result.tema = "Tema Lainnya (Konteks Lokal)";
    result.temaLokal = theme.tema;
  }

  // === 3. Jenis Kokurikuler → dropdown match ===
  const lowerJenis = (theme.jenisKokurikuler || "").toLowerCase();
  const matchedJenis = jenisOptions.find((opt) =>
    opt.toLowerCase().includes(lowerJenis.slice(0, 15)) ||
    lowerJenis.includes(opt.toLowerCase().slice(0, 15))
  );
  result.jenis = matchedJenis || jenisOptions[0];

  // === 4. Dimensi Profil Lulusan — parse comma-separated and match ===
  const dimensiResult: Record<string, string[]> = {};
  const dimensiParts = (theme.dimensi || "")
    .split(/[,;dan&]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const dimensiKeys = Object.keys(dimensiData);
  for (const part of dimensiParts) {
    const matched = dimensiKeys.find((key) => {
      const keyLower = key.toLowerCase();
      return keyLower.includes(part.slice(0, 8)) || part.includes(keyLower.slice(0, 8));
    });
    if (matched && !dimensiResult[matched]) {
      // Select all indicators for matched dimension
      dimensiResult[matched] = [...dimensiData[matched]];
    }
  }
  // Limit to max 3 dimensions
  const limitedDimensi: Record<string, string[]> = {};
  const dimensiEntries = Object.entries(dimensiResult).slice(0, 3);
  for (const [k, v] of dimensiEntries) {
    limitedDimensi[k] = v;
  }
  result.dimensi = limitedDimensi;

  // === 5. Praktik Pedagogis — keyword inference from bentukKegiatan ===
  const lowerBentuk = (theme.bentukKegiatan || "").toLowerCase();
  if (/proyek|produk|project/.test(lowerBentuk)) {
    result.praktikPedagogis = "pbl";
  } else if (/masalah|problem|solusi/.test(lowerBentuk)) {
    result.praktikPedagogis = "pbm";
  } else if (/observasi|pengamatan|inquiry|inkuiri/.test(lowerBentuk)) {
    result.praktikPedagogis = "inquiry";
  } else if (/eksplorasi|penemuan|discovery/.test(lowerBentuk)) {
    result.praktikPedagogis = "eksplorasi";
  } else {
    // Default based on jenis
    result.praktikPedagogis = lowerJenis.includes("kolaboratif") ? "pbl" : "inquiry";
  }

  // === 6. Lokasi — keyword inference ===
  const locationKeywords = lowerBentuk + " " + (theme.tema || "").toLowerCase();
  const inferredLokasi: string[] = ["Ruang Kelas"];
  if (/lapangan|luar|taman|kebun|sawah|pantai|sungai|hutan/.test(locationKeywords)) {
    inferredLokasi.push("Lingkungan Luar");
  }
  if (/kebun|tani|tanam/.test(locationKeywords)) {
    inferredLokasi.push("Kebun");
  }
  result.lokasi = inferredLokasi;

  // === 7. Lingkungan — from geografis context ===
  const geo = (context.geografis || "").toLowerCase();
  if (/pesisir|pantai|nelayan/.test(geo)) {
    result.lingkungan = "masyarakat";
  } else if (/perkotaan|industri/.test(geo)) {
    result.lingkungan = "digital";
  } else if (/pedesaan|pegunungan/.test(geo)) {
    result.lingkungan = "masyarakat";
  } else {
    result.lingkungan = "sekolah";
  }

  // === 8. Jenis Aktivitas — keyword inference ===
  const inferredAktivitas: string[] = [];
  if (/praktik|praktis|eksperimen|percobaan/.test(lowerBentuk)) inferredAktivitas.push("Praktikal");
  if (/agama|doa|ibadah|keagamaan/.test(lowerBentuk)) inferredAktivitas.push("Keagamaan");
  if (/kunjung|wisata|field trip/.test(lowerBentuk)) inferredAktivitas.push("Kunjungan");
  if (/data|survei|survey|pengukuran/.test(lowerBentuk)) inferredAktivitas.push("Penelitian Data");
  if (/literatur|baca|pustaka|riset/.test(lowerBentuk)) inferredAktivitas.push("Riset Literatur");
  if (/kampanye|advokasi|sosialisasi/.test(lowerBentuk)) inferredAktivitas.push("Advokasi");
  if (/narasumber|ahli|pakar|wawancara/.test(lowerBentuk)) inferredAktivitas.push("Pelibatan Narasumber");
  // Default if nothing matched
  if (inferredAktivitas.length === 0) {
    inferredAktivitas.push("Praktikal");
  }
  result.jenisAktivitas = inferredAktivitas;

  // === 9. Digital tools — defaults by jenjang ===
  if (context.jenjang === "SD") {
    result.digital = ["Laptop/Komputer", "Aplikasi Presentasi"];
  } else {
    result.digital = ["Laptop/Komputer", "Smartphone/Tablet", "Platform Kolaborasi Digital"];
  }

  // === 10. Kemitraan — based on context ===
  const inferredKemitraan: string[] = ["Orang Tua / Wali"];
  if (/masyarakat|komunitas/.test(locationKeywords)) inferredKemitraan.push("Masyarakat Sekitar");
  if (/industri|usaha|umkm/.test(locationKeywords + " " + (context.ekonomi || []).join(" ").toLowerCase())) {
    inferredKemitraan.push("Dunia Usaha / Industri");
  }
  if (/agama|budaya|tradisi|adat/.test(locationKeywords)) {
    inferredKemitraan.push("Lembaga Keagamaan / Budaya");
  }
  result.kemitraan = inferredKemitraan;

  // === 11. Asesmen — defaults by jenjang ===
  if (context.jenjang === "SD") {
    result.asesmenFormatif = ["Observasi"];
    result.asesmenSumatif = ["Penilaian Produk"];
  } else {
    result.asesmenFormatif = ["Observasi", "Jurnal / Refleksi Peserta Didik"];
    result.asesmenSumatif = ["Penilaian Kinerja", "Penilaian Produk"];
  }

  return result;
}
