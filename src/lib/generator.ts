import { FormData, GeneratedContent, praktikPedagogisOptions, rubrikSkala } from "./constants";

export function generateDocument(formData: FormData): GeneratedContent {
  // Tujuan pembelajaran berdasarkan dimensi yang dipilih
  const dimensiKeys = Object.keys(formData.dimensi || {});
  const tujuan: string[] = [];

  if (dimensiKeys.length > 0) {
    dimensiKeys.forEach(dim => {
      tujuan.push(`Mengembangkan dimensi "${dim}" melalui kegiatan ${formData.judul || "ko-kurikuler"}.`);
    });
  }
  tujuan.push(
    `Memahami dan menerapkan konsep ${formData.tema || "tema terpilih"} secara kontekstual dalam kehidupan sehari-hari.`,
    "Menghasilkan karya/aksi nyata yang orisinal dan bermanfaat sebagai solusi atas isu yang diangkat.",
    "Merefleksikan proses pembelajaran untuk membangun karakter pembelajar sepanjang hayat.",
  );

  // Lingkungan belajar
  let lingkunganDesc = "Lingkungan belajar disesuaikan dengan kebutuhan kegiatan.";
  if (formData.lingkungan === "sekolah") lingkunganDesc = "Lingkungan fisik dan sosial sekolah yang kondusif untuk pembelajaran aktif.";
  else if (formData.lingkungan === "masyarakat") lingkunganDesc = "Interaksi langsung dengan masyarakat sekitar sebagai sumber belajar otentik.";
  else if (formData.lingkungan === "religius") lingkunganDesc = "Suasana pembelajaran yang mengedepankan nilai-nilai spiritual dan budaya.";
  else if (formData.lingkungan === "digital") lingkunganDesc = "Pemanfaatan platform dan teknologi digital untuk kolaborasi dan eksplorasi.";

  // Praktik Pedagogis
  const pedagogi = praktikPedagogisOptions.find(p => p.value === formData.praktikPedagogis);
  const praktikPedagogisDesc = pedagogi ? pedagogi.label : "Project Based Learning (PjBL)";

  // Alur kegiatan disesuaikan dengan praktik pedagogis
  let langkahDetail: { title: string; items: string[] }[];

  if (formData.praktikPedagogis === "inquiry") {
    langkahDetail = [
      { title: "Tahap 1: Orientasi & Stimulasi", items: [
        `Mengamati fenomena terkait tema "${formData.tema}".`,
        "Merumuskan pertanyaan-pertanyaan kunci.",
        "Mengidentifikasi hal-hal yang ingin diselidiki.",
      ]},
      { title: "Tahap 2: Investigasi & Pengumpulan Data", items: [
        `Melakukan observasi/wawancara/eksperimen di ${formData.lingkungan || "lapangan"}.`,
        "Mengumpulkan data dari berbagai sumber.",
        "Mencatat temuan secara sistematis.",
      ]},
      { title: "Tahap 3: Analisis & Penarikan Kesimpulan", items: [
        "Menganalisis data yang telah dikumpulkan.",
        "Membandingkan temuan dengan hipotesis awal.",
        "Menyusun kesimpulan berdasarkan bukti.",
      ]},
      { title: "Tahap 4: Komunikasi & Refleksi", items: [
        "Mempresentasikan hasil penyelidikan.",
        "Memberikan dan menerima umpan balik.",
        "Merefleksikan proses dan hasil pembelajaran.",
      ]},
    ];
  } else if (formData.praktikPedagogis === "pbm") {
    langkahDetail = [
      { title: "Tahap 1: Orientasi Masalah", items: [
        `Mengidentifikasi permasalahan nyata terkait "${formData.tema}".`,
        "Menganalisis akar penyebab masalah.",
        "Merumuskan masalah secara spesifik.",
      ]},
      { title: "Tahap 2: Pengorganisasian Belajar", items: [
        "Membentuk kelompok kerja dan membagi peran.",
        "Menentukan sumber informasi yang diperlukan.",
        "Menyusun rencana penyelesaian masalah.",
      ]},
      { title: "Tahap 3: Penyelidikan & Solusi", items: [
        "Mengumpulkan informasi untuk pemecahan masalah.",
        `Mengembangkan solusi melalui kegiatan "${formData.judul}".`,
        "Menguji kelayakan solusi yang diusulkan.",
      ]},
      { title: "Tahap 4: Evaluasi & Refleksi", items: [
        "Mengevaluasi efektivitas solusi.",
        "Mempresentasikan hasil kerja kelompok.",
        "Menyusun rencana tindak lanjut.",
      ]},
    ];
  } else if (formData.praktikPedagogis === "eksplorasi") {
    langkahDetail = [
      { title: "Tahap 1: Stimulasi & Provokasi", items: [
        `Menyajikan stimulus terkait tema "${formData.tema}".`,
        "Membangkitkan rasa ingin tahu peserta didik.",
        "Mengidentifikasi pengetahuan awal.",
      ]},
      { title: "Tahap 2: Eksplorasi Mandiri", items: [
        "Melakukan pengamatan dan percobaan secara mandiri.",
        "Mencoba berbagai pendekatan dan teknik.",
        "Mendokumentasikan proses penemuan.",
      ]},
      { title: "Tahap 3: Penemuan & Verifikasi", items: [
        `Menemukan konsep/pola terkait "${formData.judul}".`,
        "Memverifikasi temuan dengan sumber referensi.",
        "Mengkonfirmasi pemahaman dengan diskusi kelompok.",
      ]},
      { title: "Tahap 4: Generalisasi & Penerapan", items: [
        "Menarik kesimpulan umum dari penemuan.",
        "Menerapkan konsep dalam konteks baru.",
        "Merefleksikan proses pembelajaran.",
      ]},
    ];
  } else {
    // Default: PBL (Project Based Learning)
    langkahDetail = [
      { title: "Tahap 1: Pengenalan & Perencanaan", items: [
        `Sosialisasi tema "${formData.tema}" dan tujuan kegiatan.`,
        "Asesmen diagnostik minat dan potensi peserta didik.",
        "Menyusun rencana proyek dan pembagian tugas.",
      ]},
      { title: "Tahap 2: Kontekstualisasi & Riset", items: [
        `Observasi permasalahan di ${formData.lingkungan || "lingkungan sekitar"}.`,
        "Pengumpulan data dan informasi pendukung.",
        "Diskusi perumusan ide dan proposal proyek.",
      ]},
      { title: "Tahap 3: Aksi Nyata & Pelaksanaan", items: [
        "Persiapan alat, bahan, dan sumber daya.",
        `Pelaksanaan kegiatan "${formData.judul}".`,
        "Monitoring dan bimbingan oleh fasilitator.",
      ]},
      { title: "Tahap 4: Refleksi & Publikasi", items: [
        "Pameran/presentasi hasil karya dan aksi.",
        "Evaluasi proses dan pengalaman belajar.",
        "Menyusun rencana keberlanjutan dan tindak lanjut.",
      ]},
    ];
  }

  // LKPD
  const instruksiLKPD = [
    { step: "Langkah 1: Eksplorasi", detail: `Amati kondisi di ${formData.lingkungan || "lokasi kegiatan"} yang berkaitan dengan tema "${formData.tema}". Catat hal-hal penting yang ditemukan.` },
    { step: "Langkah 2: Diskusi Kelompok", detail: `Diskusikan hasil pengamatan bersama kelompok. Fokuskan pada solusi melalui kegiatan "${formData.judul}".` },
    { step: "Langkah 3: Perencanaan Aksi", detail: "Susun rencana aksi nyata, tentukan alat dan bahan yang dibutuhkan, serta bagi peran dalam kelompok." },
    { step: "Langkah 4: Refleksi & Manfaat", detail: "Tuliskan refleksi proses pembelajaran dan prediksi manfaat kegiatan ini bagi lingkungan sekitar." },
  ];

  // Soal Uraian berdasarkan fase
  let soalUraian: string[] = [];
  if (["A", "B"].includes(formData.fase)) {
    soalUraian = [
      "Apa hal paling menarik yang kamu pelajari dari kegiatan ini?",
      "Alat dan bahan apa saja yang kamu gunakan?",
      "Bagaimana perasaanmu saat bekerja sama dengan teman?",
      "Apa yang ingin kamu lakukan selanjutnya terkait kegiatan ini?",
    ];
  } else if (["C", "D"].includes(formData.fase)) {
    soalUraian = [
      `Jelaskan alasan kelompokmu memilih solusi untuk permasalahan terkait "${formData.tema}"!`,
      "Uraikan pembagian tugas dalam kelompokmu dan bagaimana setiap anggota berkontribusi!",
      "Kendala apa yang dihadapi selama kegiatan dan bagaimana cara mengatasinya?",
      "Apa manfaat kegiatan ini bagi sekolah dan lingkungan sekitar?",
    ];
  } else {
    soalUraian = [
      `Analisis efektivitas solusi yang diterapkan terhadap permasalahan "${formData.tema}"!`,
      "Evaluasi proses kolaborasi tim secara kritis — apa yang sudah baik dan perlu diperbaiki?",
      "Bagaimana rencana keberlanjutan proyek ini ke depan?",
      "Hubungkan kegiatan proyek ini dengan Tujuan Pembangunan Berkelanjutan (SDGs) yang relevan!",
    ];
  }

  // Bahan Bacaan — menggunakan disclaimer, bukan sumber fiktif
  const temaDisplay = formData.tema === "Tema Lainnya (Konteks Lokal)" && formData.temaLokal
    ? formData.temaLokal : formData.tema;

  const articles = [
    {
      type: "summary",
      title: `Rangkuman Materi: ${formData.judul || temaDisplay}`,
      source: "Adaptasi dari Panduan Kokurikuler Kemdikbudristek 2024",
      points: [
        `Kegiatan ini bertujuan mengembangkan pemahaman peserta didik tentang "${temaDisplay}" secara kontekstual.`,
        "Melalui kegiatan kokurikuler, peserta didik dilatih untuk mengembangkan dimensi Profil Pelajar Pancasila.",
        "Proses pembelajaran menekankan pada pengalaman langsung dan refleksi bermakna.",
        "*Catatan: Konten ini merupakan kerangka awal yang perlu diadaptasi oleh guru sesuai konteks sekolah.*",
      ],
    },
    {
      type: "mindmap",
      title: `Peta Konsep: ${temaDisplay}`,
      source: "Kerangka Panduan Kokurikuler Kurikulum Merdeka",
      points: [
        `Tema Utama — ${temaDisplay}`,
        `Tujuan — Membangun kesadaran dan aksi nyata peserta didik`,
        `Dampak — Perubahan positif di lingkungan sekolah dan masyarakat`,
        `Aksi Kita — ${formData.judul || "Kegiatan Ko-Kurikuler"}`,
      ],
    },
    {
      type: "catatan",
      title: "Catatan untuk Guru",
      points: [
        "Konten yang dihasilkan merupakan kerangka awal berdasarkan Panduan Kokurikuler Kemdikbudristek 2024.",
        "Guru diharapkan menyesuaikan dan memperkaya materi sesuai dengan konteks lokal sekolah.",
        "Referensi tambahan dapat diperoleh dari platform Merdeka Mengajar dan sumber resmi Kemdikbudristek.",
      ],
    },
  ];

  return { tujuan, lingkunganDesc, praktikPedagogisDesc, langkahDetail, instruksiLKPD, soalUraian, articles };
}

