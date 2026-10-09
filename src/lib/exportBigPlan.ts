import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, WidthType, BorderStyle,
  HeadingLevel, convertMillimetersToTwip, ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import type { BigPlanTheme, SchoolContext } from "./bigPlanConstants";

const FONT = "Times New Roman";
const FONT_SIZE = 24;
const SMALL_SIZE = 22;

const borders = {
  top: { style: BorderStyle.SINGLE, size: 1 },
  bottom: { style: BorderStyle.SINGLE, size: 1 },
  left: { style: BorderStyle.SINGLE, size: 1 },
  right: { style: BorderStyle.SINGLE, size: 1 },
};

function text(t: string, opts?: { bold?: boolean; size?: number }): TextRun {
  return new TextRun({ text: t, font: FONT, size: opts?.size ?? FONT_SIZE, bold: opts?.bold });
}

function headerCell(t: string): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [text(t, { bold: true, size: SMALL_SIZE })], alignment: AlignmentType.CENTER })],
    borders,
    shading: { type: ShadingType.SOLID, color: "E8F5E9" },
  });
}

function dataCell(t: string, align?: (typeof AlignmentType)[keyof typeof AlignmentType]): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [text(t, { size: SMALL_SIZE })], alignment: align || AlignmentType.LEFT })],
    borders,
  });
}

export async function exportBigPlanDocx(ctx: SchoolContext, themes: BigPlanTheme[], planName: string) {
  const totalJP = themes.reduce((s, t) => s + t.alokasiJP, 0);

  const children: (Paragraph | Table)[] = [];

  // Header
  children.push(
    new Paragraph({ children: [text("PROGRAM TAHUNAN KOKURIKULER", { bold: true, size: 32 })], alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
    new Paragraph({ children: [text(ctx.sekolah || "Nama Sekolah", { bold: true, size: 28 })], alignment: AlignmentType.CENTER }),
    new Paragraph({ children: [text(`${ctx.jenjang} | Fase ${ctx.fase} | Kelas ${ctx.kelas}`, { size: FONT_SIZE })], alignment: AlignmentType.CENTER }),
    new Paragraph({ children: [text(`Tahun Ajaran: ${ctx.tahunAjaran}`, { size: SMALL_SIZE })], alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
    new Paragraph({ children: [text(`Total Alokasi: ${totalJP} JP / Tahun`, { bold: true, size: FONT_SIZE })], alignment: AlignmentType.CENTER, spacing: { after: 240 } }),
  );

  // Context info
  if (ctx.geografis || ctx.ekonomi?.length || ctx.sosialBudaya) {
    children.push(new Paragraph({ children: [text("Konteks Sekolah", { bold: true })], heading: HeadingLevel.HEADING_2, spacing: { before: 120, after: 120 } }));
    if (ctx.geografis) children.push(new Paragraph({ children: [text(`Kondisi Geografis: ${ctx.geografis}`, { size: SMALL_SIZE })], spacing: { after: 60 } }));
    if (ctx.ekonomi?.length) children.push(new Paragraph({ children: [text(`Potensi Ekonomi: ${ctx.ekonomi.join(", ")}`, { size: SMALL_SIZE })], spacing: { after: 60 } }));
    if (ctx.sosialBudaya) children.push(new Paragraph({ children: [text(`Karakteristik Sosial Budaya: ${ctx.sosialBudaya}`, { size: SMALL_SIZE })], spacing: { after: 120 } }));
  }

  // Table
  const headerRow = new TableRow({
    children: [
      headerCell("No"),
      headerCell("Kelas"),
      headerCell("Fokus Dimensi Profil Lulusan"),
      headerCell("Tema"),
      headerCell("Jenis Kokurikuler"),
      headerCell("Bentuk Kegiatan"),
      headerCell("Mapel Terkait"),
      headerCell("Alokasi JP"),
    ],
  });

  const dataRows = themes.map((t) =>
    new TableRow({
      children: [
        dataCell(String(t.no), AlignmentType.CENTER),
        dataCell(t.kelas, AlignmentType.CENTER),
        dataCell(t.dimensi),
        dataCell(t.tema),
        dataCell(t.jenisKokurikuler),
        dataCell(t.bentukKegiatan),
        dataCell(t.mapelTerkait),
        dataCell(String(t.alokasiJP), AlignmentType.CENTER),
      ],
    })
  );

  // Total row
  const totalRow = new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ children: [text("TOTAL", { bold: true, size: SMALL_SIZE })], alignment: AlignmentType.CENTER })],
        borders, columnSpan: 7,
        shading: { type: ShadingType.SOLID, color: "E8F5E9" },
      }),
      new TableCell({
        children: [new Paragraph({ children: [text(`${totalJP} JP`, { bold: true, size: SMALL_SIZE })], alignment: AlignmentType.CENTER })],
        borders,
        shading: { type: ShadingType.SOLID, color: "E8F5E9" },
      }),
    ],
  });

  children.push(new Table({
    rows: [headerRow, ...dataRows, totalRow],
    width: { size: 100, type: WidthType.PERCENTAGE },
  }));

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertMillimetersToTwip(20),
            right: convertMillimetersToTwip(15),
            bottom: convertMillimetersToTwip(20),
            left: convertMillimetersToTwip(15),
          },
          size: { orientation: "landscape" as any },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${planName || "Program_Tahunan"}.docx`);
}

export async function exportBigPlanXlsx(ctx: SchoolContext, themes: BigPlanTheme[], planName: string) {
  const ExcelJS = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Program Tahunan");

  // Title
  ws.mergeCells("A1:H1");
  const titleCell = ws.getCell("A1");
  titleCell.value = `PROGRAM TAHUNAN KOKURIKULER - ${ctx.sekolah || "Sekolah"}`;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: "center" };

  ws.mergeCells("A2:H2");
  const subtitleCell = ws.getCell("A2");
  subtitleCell.value = `${ctx.jenjang} | Fase ${ctx.fase} | Kelas ${ctx.kelas} | TA ${ctx.tahunAjaran}`;
  subtitleCell.alignment = { horizontal: "center" };

  // Headers
  const headers = ["No", "Kelas", "Fokus Dimensi", "Tema", "Jenis Kokurikuler", "Bentuk Kegiatan", "Mapel Terkait", "Alokasi JP"];
  const headerRow = ws.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F5E9" } };
    cell.border = {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" },
    };
  });

  // Data
  themes.forEach((t) => {
    const row = ws.addRow([t.no, t.kelas, t.dimensi, t.tema, t.jenisKokurikuler, t.bentukKegiatan, t.mapelTerkait, t.alokasiJP]);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" },
      };
    });
  });

  // Total
  const totalJP = themes.reduce((s, t) => s + t.alokasiJP, 0);
  const totalRow = ws.addRow(["", "", "", "", "", "", "TOTAL", totalJP]);
  totalRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F5E9" } };
    cell.border = {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" },
    };
  });

  // Column widths
  ws.columns = [
    { width: 5 }, { width: 8 }, { width: 25 }, { width: 25 },
    { width: 22 }, { width: 35 }, { width: 20 }, { width: 10 },
  ];

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `${planName || "Program_Tahunan"}.xlsx`);
}
