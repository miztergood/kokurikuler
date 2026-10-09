import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, WidthType, BorderStyle,
  HeadingLevel, convertMillimetersToTwip, ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import { FormData, GeneratedContent, rubrikSkala } from "./constants";

const FONT = "Times New Roman";
const FONT_SIZE = 24; // half-points (12pt)
const SMALL_SIZE = 22; // 11pt

const borders = {
  top: { style: BorderStyle.SINGLE, size: 1 },
  bottom: { style: BorderStyle.SINGLE, size: 1 },
  left: { style: BorderStyle.SINGLE, size: 1 },
  right: { style: BorderStyle.SINGLE, size: 1 },
};

function text(t: string, opts?: { bold?: boolean; size?: number; italic?: boolean }): TextRun {
  return new TextRun({ text: t, font: FONT, size: opts?.size ?? FONT_SIZE, bold: opts?.bold, italics: opts?.italic });
}

function paragraph(runs: TextRun[], opts?: { alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]; spacing?: { after?: number; before?: number } }): Paragraph {
  return new Paragraph({ children: runs, alignment: opts?.alignment, spacing: { after: opts?.spacing?.after ?? 120, before: opts?.spacing?.before ?? 0, line: 360 } });
}

function headerCell(t: string, colSpan?: number): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [text(t, { bold: true, size: SMALL_SIZE })], alignment: AlignmentType.LEFT })],
    borders,
    shading: { type: ShadingType.SOLID, color: "F0F0F0" },
    columnSpan: colSpan,
  });
}

function cell(t: string, colSpan?: number): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [text(t, { size: SMALL_SIZE })], alignment: AlignmentType.LEFT })],
    borders,
    columnSpan: colSpan,
  });
}

function sectionHeading(t: string): Paragraph {
  return new Paragraph({
    children: [text(t, { bold: true })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, space: 4 } },
  });
}

export async function exportToDocx(formData: FormData, content: GeneratedContent) {
  const temaDisplay = formData.tema === "Tema Lainnya (Konteks Lokal)" && formData.temaLokal
    ? formData.temaLokal : formData.tema;

  const children: (Paragraph | Table)[] = [];

  // ===== HEADER =====
  children.push(
    paragraph([text("RENCANA KEGIATAN KO-KURIKULER", { bold: true, size: 32 })], { alignment: AlignmentType.CENTER }),
    paragraph([text(formData.sekolah || "Nama Sekolah", { bold: true, size: 28 })], { alignment: AlignmentType.CENTER }),
    paragraph([text(formData.jenjang, { size: FONT_SIZE })], { alignment: AlignmentType.CENTER }),
    paragraph([text(`Tahun Ajaran: ${formData.tahunAjaran}`, { size: SMALL_SIZE })], { alignment: AlignmentType.CENTER, spacing: { after: 240 } }),
  );

  // ===== SUMMARY TABLE =====
  const summaryRows: TableRow[] = [
    new TableRow({ children: [headerCell("Fase / Kelas"), cell(`${formData.fase ? `${formData.fase} - ` : ""}${formData.kelas}`), headerCell("Alokasi Waktu"), cell(formData.waktu)] }),
    new TableRow({ children: [headerCell("Tema"), cell(temaDisplay), headerCell("Rencana Waktu"), cell(formData.rencanaWaktu)] }),
    new TableRow({ children: [
      headerCell("Bentuk Kegiatan"),
      cell(`${formData.jenis}${formData.jenisLain ? ` (${formData.jenisLain})` : ""}${formData.detail7kaih?.length > 0 ? ` | 7KAIH: ${formData.detail7kaih.join(", ")}` : ""}${formData.lintasMapel ? ` | Terintegrasi: ${formData.lintasMapel}` : ""}`, 3),
    ] }),
    new TableRow({ children: [headerCell("Judul Kegiatan"), cell(formData.judul, 3)] }),
  ];
  if (formData.praktikPedagogis) {
    summaryRows.push(new TableRow({ children: [headerCell("Praktik Pedagogis"), cell(content.praktikPedagogisDesc, 3)] }));
  }
  if (formData.jenisAktivitas?.length > 0) {
    summaryRows.push(new TableRow({ children: [headerCell("Jenis Aktivitas"), cell(formData.jenisAktivitas.join(", "), 3)] }));
  }

  children.push(new Table({
    rows: summaryRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  }));
  children.push(paragraph([])); // spacer

  // ===== A. DIMENSI PROFIL LULUSAN =====
  children.push(sectionHeading("A. DIMENSI PROFIL LULUSAN"));
  const dimEntries = Object.entries(formData.dimensi || {});
  if (dimEntries.length > 0) {
    dimEntries.forEach(([dim, inds]) => {
      children.push(paragraph([text(`${dim}: `, { bold: true }), text(inds.join("; ") + ".")]));
    });
  } else {
    children.push(paragraph([text("Belum ada dimensi yang dipilih.", { italic: true })]));
  }

  // ===== B. TUJUAN PEMBELAJARAN =====
  children.push(sectionHeading("B. TUJUAN PEMBELAJARAN"));
  content.tujuan.forEach((t, i) => {
    children.push(paragraph([text(`${i + 1}. ${t}`)]));
  });

  // ===== C. LINGKUNGAN & METODE =====
  children.push(sectionHeading("C. LINGKUNGAN & METODE"));
  children.push(paragraph([text("Praktik Pedagogis: ", { bold: true }), text(content.praktikPedagogisDesc)]));
  children.push(paragraph([text("Lingkungan Belajar: ", { bold: true }), text(content.lingkunganDesc)]));
  children.push(paragraph([text("Mitra Kerjasama: ", { bold: true }), text(formData.kemitraan.length > 0 ? formData.kemitraan.join(", ") : "-")]));
  children.push(paragraph([text("Teknologi Digital: ", { bold: true }), text(formData.digital.length > 0 ? formData.digital.join(", ") : "-")]));
  if (formData.jenisAktivitas?.length > 0) {
    children.push(paragraph([text("Jenis Aktivitas: ", { bold: true }), text(formData.jenisAktivitas.join(", "))]));
  }

  // ===== D. ALUR KEGIATAN =====
  children.push(sectionHeading("D. ALUR KEGIATAN"));
  content.langkahDetail.forEach(phase => {
    children.push(paragraph([text(phase.title, { bold: true })]));
    phase.items.forEach(item => {
      children.push(new Paragraph({
        children: [text(item, { size: SMALL_SIZE })],
        spacing: { after: 60, line: 360 },
        bullet: { level: 0 },
      }));
    });
  });

  // ===== E. ASESMEN & EVALUASI =====
  children.push(sectionHeading("E. ASESMEN & EVALUASI"));

  // LKPD
  children.push(paragraph([text("1. Lembar Kerja Peserta Didik (LKPD)", { bold: true })]));
  children.push(paragraph([text(`LKPD: ${formData.judul}`, { bold: true })], { alignment: AlignmentType.CENTER }));
  children.push(paragraph([text("Nama Kelompok: ............................................................")]));
  children.push(paragraph([text("Anggota: 1).......... 2).......... 3).......... 4)..........")]));
  children.push(paragraph([text("A. Langkah Pengerjaan:", { bold: true })]));
  content.instruksiLKPD.forEach(s => {
    children.push(paragraph([text(s.step, { bold: true, size: SMALL_SIZE })]));
    children.push(paragraph([text(s.detail, { size: SMALL_SIZE })]));
  });
  children.push(paragraph([text("B. Soal Uraian:", { bold: true })]));
  content.soalUraian.forEach((q, i) => {
    children.push(paragraph([text(`${i + 1}. ${q}`, { size: SMALL_SIZE })]));
  });

  // Rubrik
  children.push(paragraph([text("2. Rubrik Penilaian", { bold: true })], { spacing: { before: 240 } }));
  if (dimEntries.length > 0) {
    const rubrikRows: TableRow[] = [];
    // Header rows
    rubrikRows.push(new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [text("Indikator", { bold: true, size: SMALL_SIZE })] })], borders, rowSpan: 2, shading: { type: ShadingType.SOLID, color: "F0F0F0" } }),
        new TableCell({ children: [new Paragraph({ children: [text("Penilaian", { bold: true, size: SMALL_SIZE })], alignment: AlignmentType.CENTER })], borders, columnSpan: 4, shading: { type: ShadingType.SOLID, color: "F0F0F0" } }),
      ],
    }));
    rubrikRows.push(new TableRow({
      children: rubrikSkala.map(s =>
        new TableCell({ children: [new Paragraph({ children: [text(`${s.kode} (${s.label})`, { bold: true, size: 18 })], alignment: AlignmentType.CENTER })], borders, shading: { type: ShadingType.SOLID, color: "F8F8F8" } })
      ),
    }));
    dimEntries.forEach(([dim, inds]) => {
      rubrikRows.push(new TableRow({
        children: [new TableCell({ children: [new Paragraph({ children: [text(dim, { bold: true, size: SMALL_SIZE })] })], borders, columnSpan: 5, shading: { type: ShadingType.SOLID, color: "F8F8F8" } })],
      }));
      inds.forEach(ind => {
        rubrikRows.push(new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [text(ind, { size: SMALL_SIZE })] })], borders }),
            ...rubrikSkala.map(() =>
              new TableCell({ children: [new Paragraph({ children: [text("☐", { size: SMALL_SIZE })], alignment: AlignmentType.CENTER })], borders })
            ),
          ],
        }));
      });
    });
    children.push(new Table({ rows: rubrikRows, width: { size: 100, type: WidthType.PERCENTAGE } }));

    // Keterangan
    children.push(paragraph([text("Keterangan Skala Penilaian:", { bold: true, size: 20 })], { spacing: { before: 120 } }));
    rubrikSkala.forEach(s => {
      children.push(paragraph([text(`${s.kode} (${s.label}): `, { bold: true, size: 20 }), text(s.deskripsi, { size: 20 })]));
    });
  }

  // Bahan Bacaan
  children.push(paragraph([text("3. Bahan Bacaan Pendukung", { bold: true })], { spacing: { before: 240 } }));
  content.articles.forEach(article => {
    children.push(paragraph([text(article.title, { bold: true, size: SMALL_SIZE })]));
    if (article.source) {
      children.push(paragraph([text(`Sumber: ${article.source}`, { italic: true, size: 20 })]));
    }
    article.points.forEach(p => {
      children.push(new Paragraph({
        children: [text(p, { size: SMALL_SIZE })],
        spacing: { after: 60, line: 360 },
        bullet: { level: 0 },
      }));
    });
  });

  // ===== GLOSARIUM =====
  children.push(sectionHeading("GLOSARIUM"));
  const glossary = [
    ["Kokurikuler", "Kegiatan yang dirancang untuk memperkuat pencapaian kompetensi dan karakter melalui Profil Pelajar Pancasila."],
    ["7KAIH", "Tujuh Kebiasaan Anak Indonesia Hebat — gerakan pembiasaan positif bagi peserta didik."],
    ["Asesmen Autentik", "Penilaian yang mengukur kinerja nyata peserta didik dalam konteks bermakna."],
    [temaDisplay, "Fokus utama pembahasan dalam kegiatan kokurikuler ini."],
  ];
  glossary.forEach(([term, desc]) => {
    children.push(paragraph([text(`${term}: `, { bold: true, size: SMALL_SIZE }), text(desc, { size: SMALL_SIZE })]));
  });

  // ===== DAFTAR PUSTAKA =====
  children.push(sectionHeading("DAFTAR PUSTAKA"));
  const refs = [
    'Kemendikbudristek. (2024). Panduan Kokurikuler Kurikulum Merdeka. Jakarta: Badan Standar, Kurikulum, dan Asesmen Pendidikan.',
    'Kemendikbudristek. (2024). Kerangka Kurikulum Merdeka. Jakarta: BSKAP Kemdikbudristek.',
    'Platform Merdeka Mengajar. https://guru.kemdikbud.go.id. Diakses 2025.',
  ];
  refs.forEach((r, i) => {
    children.push(paragraph([text(`${i + 1}. ${r}`, { size: SMALL_SIZE })]));
  });

  // ===== TANDA TANGAN =====
  children.push(paragraph([], { spacing: { before: 480 } }));
  const signRow = new TableRow({
    children: [
      new TableCell({
        children: [
          paragraph([text("Mengetahui,")], { alignment: AlignmentType.CENTER }),
          paragraph([text("Kepala Sekolah", { bold: true })], { alignment: AlignmentType.CENTER }),
          paragraph([]), paragraph([]), paragraph([]),
          paragraph([text(formData.kepalaSekolah || "____________________")], { alignment: AlignmentType.CENTER }),
          paragraph([text(`NIP. ${formData.nipKepala || ".................."}`, { size: SMALL_SIZE })], { alignment: AlignmentType.CENTER }),
        ],
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      }),
      new TableCell({
        children: [
          paragraph([text("Jakarta, ..................... 2026")], { alignment: AlignmentType.CENTER }),
          paragraph([text("Koordinator Ko-Kurikuler", { bold: true })], { alignment: AlignmentType.CENTER }),
          paragraph([]), paragraph([]), paragraph([]),
          paragraph([text(formData.koordinator || "____________________")], { alignment: AlignmentType.CENTER }),
          paragraph([text(`NIP. ${formData.nipKoordinator || ".................."}`, { size: SMALL_SIZE })], { alignment: AlignmentType.CENTER }),
        ],
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      }),
    ],
  });
  children.push(new Table({
    rows: [signRow],
    width: { size: 100, type: WidthType.PERCENTAGE },
  }));

  // ===== BUILD & SAVE =====
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertMillimetersToTwip(20),
            right: convertMillimetersToTwip(20),
            bottom: convertMillimetersToTwip(20),
            left: convertMillimetersToTwip(20),
          },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Modul_${formData.judul || "Ko-Kurikuler"}.docx`);
}
