// === Big Plan Constants ===

export const geografisOptions = [
  "Pedesaan",
  "Perkotaan",
  "Pesisir Pantai",
  "Pegunungan",
  "Kawasan Industri",
];

export const ekonomiOptions = [
  "Pertanian",
  "Nelayan / Perikanan",
  "Perdagangan",
  "Pariwisata",
  "Perkebunan",
  "Peternakan",
  "Industri / Manufaktur",
  "Jasa / UMKM",
];

export interface BigPlanTheme {
  no: number;
  kelas: string;
  dimensi: string;
  tema: string;
  jenisKokurikuler: string;
  bentukKegiatan: string;
  mapelTerkait: string;
  alokasiJP: number;
}

export interface SchoolContext {
  sekolah: string;
  jenjang: string;
  fase: string;
  kelas: string;
  tahunAjaran: string;
  totalJP: number;
  jumlahTema: number;
  geografis: string;
  ekonomi: string[];
  sosialBudaya: string;
}

export interface BigPlan {
  id: string;
  user_id: string;
  name: string;
  school_context: SchoolContext;
  themes: BigPlanTheme[];
  created_at: string;
  updated_at: string;
}

export const initialSchoolContext: SchoolContext = {
  sekolah: "",
  jenjang: "",
  fase: "",
  kelas: "",
  tahunAjaran: "",
  totalJP: 0,
  jumlahTema: 0,
  geografis: "",
  ekonomi: [],
  sosialBudaya: "",
};
