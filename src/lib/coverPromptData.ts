import { FormData } from "@/lib/constants";

export interface DesignStyle {
  style_name: string;
  description: string;
  background_style: string;
  ornament: string;
  typography: string;
  color_palette: {
    primary: string;
    secondary: string;
    accent: string;
    application_instruction: string;
  };
}

export const designStyles: DesignStyle[] = [
  {
    style_name: "Modern Education Minimal",
    description: "Clean, minimalist educational design with geometric shapes and soft pastel tones",
    background_style: "Soft white background with subtle geometric patterns in pastel blue and green",
    ornament: "Minimal geometric shapes, thin lines, and rounded corners",
    typography: "Modern sans-serif headline (bold), clean body text",
    color_palette: { primary: "#1A365D", secondary: "#63B3ED", accent: "#F7FAFC", application_instruction: "Use navy as primary text, sky blue for accents and decorative elements, white/light gray background." },
  },
  {
    style_name: "Colorful Cartoon Kids",
    description: "Playful and vibrant cartoon-style design perfect for elementary school activities",
    background_style: "Bright yellow/orange gradient with cartoon doodle patterns (pencils, books, stars)",
    ornament: "Hand-drawn doodle borders, star bursts, cloud shapes",
    typography: "Rounded bold display font for title, friendly sans-serif for body",
    color_palette: { primary: "#E53E3E", secondary: "#F6E05E", accent: "#48BB78", application_instruction: "Use bright primary colors. Red for headlines, yellow background, green accents. Keep it cheerful and energetic." },
  },
  {
    style_name: "Islamic Green Elegant",
    description: "Elegant Islamic-themed design with arabesque patterns and green-gold palette",
    background_style: "Deep emerald green gradient with subtle islamic geometric pattern overlay",
    ornament: "Gold arabesque frame borders, crescent and star motifs, mosque silhouette",
    typography: "Classic serif headline with gold color, elegant body text in white",
    color_palette: { primary: "#0F2E2E", secondary: "#D4AF37", accent: "#F5F1E6", application_instruction: "Deep green background, gold ornamental elements, cream/white text for high contrast." },
  },
  {
    style_name: "Nature Explorer",
    description: "Nature-inspired design with botanical illustrations and earthy tones",
    background_style: "Soft green watercolor wash with leaf and botanical illustrations",
    ornament: "Watercolor leaves, branches, and flower accents around borders",
    typography: "Organic serif headline, natural-feeling body font",
    color_palette: { primary: "#22543D", secondary: "#9AE6B4", accent: "#FFFFF0", application_instruction: "Use forest green as primary, mint green accents, ivory background. Natural and calming feel." },
  },
  {
    style_name: "Science Lab Theme",
    description: "Scientific and tech-inspired design with molecular patterns and modern layout",
    background_style: "Dark navy blue background with molecular structure and circuit board patterns",
    ornament: "Atom icons, DNA helix, beaker/flask illustrations, hexagonal grid",
    typography: "Tech-style mono headline, clean sans-serif body",
    color_palette: { primary: "#1A202C", secondary: "#00D1FF", accent: "#FFFFFF", application_instruction: "Dark background with cyan/electric blue highlights. White text for contrast. Futuristic feel." },
  },
  {
    style_name: "Batik Nusantara",
    description: "Indonesian batik-inspired design celebrating local culture and heritage",
    background_style: "Rich brown/maroon background with traditional batik parang or kawung pattern",
    ornament: "Batik border patterns, wayang silhouette accents, gold filigree",
    typography: "Bold serif headline with gold effect, warm-toned body text",
    color_palette: { primary: "#5B2C1A", secondary: "#C89B3C", accent: "#FFF8E7", application_instruction: "Deep brown primary, gold ornamental accents, warm cream for text areas. Traditional and dignified." },
  },
  {
    style_name: "Pastel Watercolor",
    description: "Soft pastel watercolor aesthetic with gentle gradients and artistic feel",
    background_style: "Soft pastel pink, blue, and lavender watercolor blended background",
    ornament: "Watercolor brush stroke borders, soft cloud and rainbow accents",
    typography: "Elegant script headline, soft rounded sans-serif body",
    color_palette: { primary: "#553C9A", secondary: "#F687B3", accent: "#FEFCBF", application_instruction: "Soft lavender and pink tones. Use purple for text, pink for accents, pale yellow highlights." },
  },
  {
    style_name: "Pancasila Heritage",
    description: "Patriotic Indonesian design with Garuda and red-white national theme",
    background_style: "Red and white gradient with subtle Garuda Pancasila watermark",
    ornament: "National emblem accents, ribbon borders, star motifs from Pancasila symbols",
    typography: "Strong bold serif for headline, professional sans-serif body",
    color_palette: { primary: "#9B2C2C", secondary: "#C53030", accent: "#FFFFFF", application_instruction: "Red as dominant color, white for contrast. Gold accents for official feel. Patriotic and formal." },
  },
  {
    style_name: "Creative Arts Studio",
    description: "Artistic and creative design with paint splashes and craft materials",
    background_style: "White canvas background with colorful paint splash and brush stroke accents",
    ornament: "Paint splatters, crayon strokes, paper cutout shapes, craft scissors icon",
    typography: "Hand-painted style headline, playful handwritten body font",
    color_palette: { primary: "#2D3748", secondary: "#ED8936", accent: "#FED7D7", application_instruction: "Dark gray text on white, orange and warm accents. Creative and expressive art studio vibe." },
  },
  {
    style_name: "Digital Smart School",
    description: "Modern digital-era design with tablet, laptop, and smart technology icons",
    background_style: "Clean blue-white gradient with digital grid and pixel art patterns",
    ornament: "Laptop, tablet, wifi icons, digital pixel borders, QR code placeholder",
    typography: "Modern geometric sans-serif headline, clean digital body font",
    color_palette: { primary: "#2B6CB0", secondary: "#4FD1C5", accent: "#EBF8FF", application_instruction: "Professional blue primary, teal accent, very light blue background. Modern digital education feel." },
  },
];

export function generateTitleOptions(formData: FormData): string[] {
  const { judul, tema, kelas, sekolah, jenjang } = formData;
  const temaDisplay = formData.tema === "Tema Lainnya (Konteks Lokal)" && formData.temaLokal
    ? formData.temaLokal : tema;

  const titles: string[] = [];
  if (judul) titles.push(judul);
  titles.push(`Modul Ajar Kokurikuler: ${judul || temaDisplay}`);
  titles.push(`${temaDisplay} — Kegiatan Kokurikuler ${kelas || jenjang}`);
  if (sekolah) titles.push(`Rencana Kokurikuler ${sekolah}`);
  titles.push(`Rencana Pembelajaran Kokurikuler: ${judul || temaDisplay} (${kelas || jenjang})`);

  // Ensure exactly 5
  while (titles.length < 5) {
    titles.push(`Modul Ajar Kokurikuler — ${temaDisplay} (${jenjang})`);
  }
  return titles.slice(0, 5);
}

export function generateIllustrationSuggestion(formData: FormData): string {
  const temaDisplay = formData.tema === "Tema Lainnya (Konteks Lokal)" && formData.temaLokal
    ? formData.temaLokal : formData.tema;
  const judul = formData.judul || temaDisplay;
  const jenjang = formData.jenjang || "sekolah";
  const kelas = formData.kelas || "";

  return `Illustration of ${jenjang} students (${kelas}) doing activity related to "${judul}" with theme "${temaDisplay}". Show children actively engaged in collaborative learning in a school environment. Bright, positive, and educational atmosphere.`;
}

export interface CoverTextElements {
  namaSekolah: boolean;
  kelasFase: boolean;
  judulKegiatan: boolean;
  namaPenyusun: boolean;
  tahunAjaran: boolean;
  jenjang: boolean;
  tema: boolean;
}

export function buildCoverPromptJSON(
  formData: FormData,
  selectedStyle: DesignStyle,
  selectedTitle: string,
  textElements: CoverTextElements,
  illustration: string
) {
  const temaDisplay = formData.tema === "Tema Lainnya (Konteks Lokal)" && formData.temaLokal
    ? formData.temaLokal : formData.tema;

  const layoutStructure: any[] = [];

  // DOCUMENT TYPE BANNER
  layoutStructure.push({
    area: "DOCUMENT_TYPE_BANNER",
    height_percentage: "10%",
    elements: {
      text: "MODUL AJAR KOKURIKULER",
      design_instruction: "Large, bold, uppercase text centered at the very top. Use primary color or white on colored background. This is the most prominent text element on the cover.",
    },
  });

  // TOP HEADER
  const topElements: any = {};
  if (textElements.namaSekolah) topElements.school_name = formData.sekolah || "Nama Sekolah";
  if (textElements.kelasFase) topElements.class_info = `${formData.fase ? `Fase ${formData.fase} — ` : ""}${formData.kelas}`;
  if (textElements.jenjang) topElements.jenjang = formData.jenjang;
  topElements.design_instruction = "Place school name centered below the document type banner. Class info below in smaller text.";
  layoutStructure.push({ area: "TOP_HEADER", height_percentage: "15%", elements: topElements });

  // HERO ILLUSTRATION
  layoutStructure.push({
    area: "HERO_ILLUSTRATION",
    height_percentage: "30%",
    elements: {
      illustration_description: illustration,
      instruction: "Generate a thematic illustration that represents the activity. Centered, visually engaging, with soft edges blending into background.",
    },
  });

  // TITLE SECTION
  const titleElements: any = { main_title: selectedTitle };
  if (textElements.tema) titleElements.subtitle = `Tema: ${temaDisplay}`;
  if (textElements.judulKegiatan && selectedTitle !== formData.judul) titleElements.activity_title = formData.judul;
  titleElements.design_instruction = "Use bold, large typography for the main title. Subtitle in smaller elegant text below.";
  layoutStructure.push({ area: "TITLE_SECTION", height_percentage: "25%", elements: titleElements });

  // FOOTER
  const footerElements: any = {};
  if (textElements.namaPenyusun) footerElements.author_name = formData.koordinator || "Nama Penyusun";
  if (textElements.tahunAjaran) footerElements.year = formData.tahunAjaran || "Tahun Ajaran";
  footerElements.design_instruction = "Place author name and year at the bottom. Keep inside safe margin area.";
  layoutStructure.push({ area: "FOOTER", height_percentage: "15%", safe_margin_bottom: "10%", elements: footerElements });

  return {
    meta_info: {
      purpose: "AI Image Generator Prompt for Kokurikuler Module Cover",
      target_platform: "ChatGPT / Gemini / Midjourney / Ideogram / DALL-E / Adobe Firefly",
      aspect_ratio: "A4 (210mm x 297mm)",
      style: selectedStyle.style_name,
      style_description: selectedStyle.description,
      color_palette: {
        mode: "custom",
        ...selectedStyle.color_palette,
      },
    },
    cover_data: {
      document_type: "Modul Ajar Kokurikuler",
      title: selectedTitle,
      subtitle: `Tema: ${temaDisplay}`,
      school_name: formData.sekolah || "Nama Sekolah",
      class: `${formData.fase ? `Fase ${formData.fase} — ` : ""}${formData.kelas}`,
      author: formData.koordinator || "Nama Penyusun",
      year: formData.tahunAjaran || "Tahun Ajaran",
      illustration_description: illustration,
    },
    design_options: [
      {
        style_name: selectedStyle.style_name,
        description: selectedStyle.description,
        background_style: selectedStyle.background_style,
        ornament: selectedStyle.ornament,
        typography: selectedStyle.typography,
      },
    ],
    layout_structure: layoutStructure,
  };
}
