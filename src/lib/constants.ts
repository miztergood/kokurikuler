export const jenjangOptions = ["SD", "SMP", "SMA", "SMK"];

export const phases = [
  { value: "A", label: "Fase A" },
  { value: "B", label: "Fase B" },
  { value: "C", label: "Fase C" },
  { value: "D", label: "Fase D" },
  { value: "E", label: "Fase E" },
  { value: "F", label: "Fase F" },
];

// === TEMA RESMI KOKURIKULER (Panduan Kemdikbud 2024) ===
export const themeOptions = [
  "Generasi sehat dan bugar",
  "Peduli dan berbagi",
  "Aku cinta Indonesia",
  "Hidup hemat dan produktif",
  "Berkarya untuk sesama dan bangsa",
  "Gaya hidup berkelanjutan",
  "Tema Lainnya (Konteks Lokal)",
];

// === BENTUK KEGIATAN RESMI ===
export const jenisOptions = [
  "Pembelajaran Kolaboratif Lintas Disiplin Ilmu",
  "Gerakan 7KAIH",
  "Cara Lainnya",
];

// === DETAIL 7KAIH (7 Kebiasaan Anak Indonesia Hebat) ===
export const detail7KAIH = [
  "Beriman dan bertakwa kepada Tuhan YME",
  "Bergerak aktif",
  "Membaca",
  "Berkarya kreatif",
  "Bergotong royong",
  "Menjaga kebersihan dan kesehatan",
  "Melestarikan alam dan budaya",
];

// === JENIS AKTIVITAS RESMI (7 Kategori) ===
export const jenisAktivitasOptions = [
  "Praktikal",
  "Keagamaan",
  "Kunjungan",
  "Penelitian Data",
  "Riset Literatur",
  "Advokasi",
  "Pelibatan Narasumber",
];

// === PRAKTIK PEDAGOGIS RESMI (4 Opsi) ===
export const praktikPedagogisOptions = [
  { value: "inquiry", label: "Pembelajaran Berbasis Inkuiri (Inquiry Based Learning)" },
  { value: "pbl", label: "Pembelajaran Berbasis Proyek (Project Based Learning)" },
  { value: "pbm", label: "Pembelajaran Berbasis Masalah (Problem Based Learning)" },
  { value: "eksplorasi", label: "Eksplorasi dan Penemuan (Discovery Learning)" },
];

// === LINGKUNGAN PEMBELAJARAN RESMI (4 Komponen) ===
export const lingkunganOptions = [
  { value: "sekolah", label: "Lingkungan Fisik dan Sosial Sekolah" },
  { value: "masyarakat", label: "Lingkungan Masyarakat Sekitar" },
  { value: "religius", label: "Lingkungan Budaya dan Religius" },
  { value: "digital", label: "Lingkungan Digital / Maya" },
];

// === TEKNOLOGI DIGITAL RESMI (6 Opsi) ===
export const digitalTools = [
  "Laptop/Komputer",
  "Smartphone/Tablet",
  "Platform Kolaborasi Digital",
  "Aplikasi Presentasi",
  "Media Sosial Edukasi",
  "Perangkat IoT/Sensor",
];

// === KEMITRAAN CATUR PUSAT PENDIDIKAN RESMI ===
export const kemitraanOptions = [
  "Orang Tua / Wali",
  "Masyarakat Sekitar",
  "Dunia Usaha / Industri",
  "Lembaga Keagamaan / Budaya",
];

// === ASESMEN RESMI ===
export const asesmenFormatifOptions = [
  "Observasi",
  "Jurnal / Refleksi Peserta Didik",
  "Interaksi Lisan",
];

export const asesmenSumatifOptions = [
  "Penilaian Kinerja",
  "Penilaian Produk",
  "Lembar Kebiasaan",
];

// === SKALA RUBRIK 4 TINGKAT RESMI (SB/B/C/K) ===
export const rubrikSkala = [
  { kode: "SB", label: "Sangat Baik", deskripsi: "Peserta didik menunjukkan penguasaan yang sangat baik dan konsisten." },
  { kode: "B", label: "Baik", deskripsi: "Peserta didik menunjukkan penguasaan yang baik dengan sedikit bimbingan." },
  { kode: "C", label: "Cukup", deskripsi: "Peserta didik menunjukkan penguasaan dasar dengan bimbingan." },
  { kode: "K", label: "Kurang", deskripsi: "Peserta didik masih memerlukan bimbingan intensif." },
];

// === ALOKASI WAKTU (JP per Tahun) RESMI ===
export const alokasiWaktu: Record<string, Record<string, number>> = {
  SD: {
    "I": 216, "II": 216,
    "III": 252, "IV": 252,
    "V": 288, "VI": 288,
  },
  SMP: {
    "VII": 360, "VIII": 360, "IX": 360,
  },
  SMA: {
    "X": 360, "XI": 360, "XII": 360,
  },
  SMK: {
    "X": 360, "XI": 360, "XII": 360,
  },
};

export const lokasiOptions = ["Ruang Kelas", "Kebun", "Lingkungan Luar"];

// === DURASI 1 JP PER JENJANG (menit) ===
export const durasiJP: Record<string, number> = {
  SD: 35,
  SMP: 40,
  SMA: 45,
  SMK: 45,
};

// === MAPPING FASE → KELAS (Referensi Resmi Kurikulum Merdeka) ===
export const faseKelasMap: Record<string, string[]> = {
  A: ["I", "II"],
  B: ["III", "IV"],
  C: ["V", "VI"],
  D: ["VII", "VIII", "IX"],
  E: ["X"],
  F: ["XI", "XII"],
};

// === DIMENSI PROFIL LULUSAN RESMI (8 Dimensi) ===
export const dimensiData: Record<string, string[]> = {
  "Keimanan dan Ketakwaan terhadap Tuhan YME": [
    "Menunjukkan perilaku berdoa sebelum dan sesudah kegiatan.",
    "Menghargai perbedaan agama dalam aktivitas bersama.",
    "Bersikap jujur dan bertanggung jawab sesuai nilai agama.",
  ],
  "Kewargaan": [
    "Mematuhi aturan dan norma bersama.",
    "Menunjukkan kepedulian terhadap lingkungan sekitar.",
    "Berpartisipasi aktif dalam kegiatan sosial kemasyarakatan.",
  ],
  "Kolaborasi": [
    "Mampu bekerja sama dalam kelompok secara efektif.",
    "Menghargai pendapat dan kontribusi orang lain.",
    "Menyelesaikan konflik secara musyawarah dan mufakat.",
  ],
  "Penalaran Kritis": [
    "Mengidentifikasi masalah nyata di lingkungan sekitar.",
    "Menganalisis informasi dari berbagai sumber.",
    "Menyusun argumen logis berdasarkan data dan fakta.",
  ],
  "Kreativitas": [
    "Menghasilkan karya orisinal dan inovatif.",
    "Memanfaatkan media dan bahan secara kreatif.",
    "Berani mencoba pendekatan dan solusi baru.",
  ],
  "Kemandirian": [
    "Mengatur waktu dan tugas secara mandiri.",
    "Menyelesaikan tanggung jawab tanpa bergantung pada orang lain.",
    "Menunjukkan inisiatif dalam kegiatan pembelajaran.",
  ],
  "Komunikasi": [
    "Menyampaikan ide dan gagasan dengan jelas.",
    "Mampu berdiskusi dan berargumentasi secara santun.",
    "Menjadi pendengar yang baik dan responsif.",
  ],
  "Kesehatan": [
    "Menerapkan kebiasaan hidup bersih dan sehat.",
    "Mengelola emosi dan stres secara positif.",
    "Menjaga keselamatan diri dan orang lain.",
  ],
};

export interface FormData {
  sekolah: string;
  tahunAjaran: string;
  jenjang: string;
  fase: string;
  kelas: string;
  waktu: string;
  rencanaWaktu: string;
  jenis: string;
  jenisLain: string;
  detail7kaih: string[];
  tema: string;
  temaLokal: string;
  lintasMapel: string;
  judul: string;
  lokasi: string[];
  dimensi: Record<string, string[]>;
  lingkungan: string;
  digital: string[];
  kemitraan: string[];
  asesmenFormatif: string[];
  asesmenSumatif: string[];
  jenisAktivitas: string[];
  praktikPedagogis: string;
  kepalaSekolah: string;
  nipKepala: string;
  koordinator: string;
  nipKoordinator: string;
  jumlahKegiatan: string;
  jumlahPertemuan: string;
}

export const initialFormState: FormData = {
  sekolah: "",
  tahunAjaran: "",
  jenjang: "",
  fase: "",
  kelas: "",
  waktu: "",
  rencanaWaktu: "",
  jenis: "",
  jenisLain: "",
  detail7kaih: [],
  tema: "",
  temaLokal: "",
  lintasMapel: "",
  judul: "",
  lokasi: [],
  dimensi: {},
  lingkungan: "",
  digital: [],
  kemitraan: [],
  asesmenFormatif: [],
  asesmenSumatif: [],
  jenisAktivitas: [],
  praktikPedagogis: "",
  kepalaSekolah: "",
  nipKepala: "",
  koordinator: "",
  nipKoordinator: "",
  jumlahKegiatan: "",
  jumlahPertemuan: "",
};

export const IDENTIFIKASI_FIELDS = [
  'sekolah', 'kepalaSekolah', 'nipKepala', 'koordinator', 'nipKoordinator', 'fase', 'kelas',
] as const;

export type IdentifikasiFieldKey = typeof IDENTIFIKASI_FIELDS[number];

export interface GeneratedContent {
  tujuan: string[];
  lingkunganDesc: string;
  praktikPedagogisDesc: string;
  langkahDetail: { title: string; items: string[] }[];
  instruksiLKPD: { step: string; detail: string }[];
  soalUraian: string[];
  articles: { type: string; title: string; points: string[]; source?: string }[];
}
