import { useRef, useState } from "react";
import { Download, FileText, ImageIcon, LayoutTemplate, RotateCcw } from "lucide-react";
import { FormData, GeneratedContent, rubrikSkala } from "@/lib/constants";
import { exportToDocx } from "@/lib/exportDocx";
import { CoverPromptModal } from "@/components/CoverPromptModal";

interface Props {
  formData: FormData;
  content: GeneratedContent | null;
  isGenerating?: boolean;
  onReset?: () => void;
}

export function DocumentPreview({ formData, content, isGenerating, onReset }: Props) {
  const docRef = useRef<HTMLDivElement>(null);
  const [coverModalOpen, setCoverModalOpen] = useState(false);

  if (isGenerating) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <h3 className="font-display font-bold text-xl mb-2">Mengolah dengan AI...</h3>
          <p className="text-muted-foreground">Gemini sedang membuat konten modul yang mendalam dan kontekstual. Mohon tunggu beberapa detik.</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="border-2 border-dashed border-foreground/20 rounded-xl p-12 text-center max-w-md">
          <LayoutTemplate size={64} className="mx-auto text-muted-foreground/30 mb-6" />
          <h3 className="font-display font-bold text-xl mb-2">Workspace Kosong</h3>
          <p className="text-muted-foreground">Isi formulir di sebelah kiri lalu klik "Generate Modul" untuk membuat dokumen.</p>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    exportToDocx(formData, content);
  };

  const temaDisplay = formData.tema === "Tema Lainnya (Konteks Lokal)" && formData.temaLokal
    ? formData.temaLokal : formData.tema;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-10 bg-card border-b-2 border-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="text-primary" size={20} />
          <span className="font-display font-bold uppercase tracking-wide">Preview Dokumen</span>
        </div>
        <div className="flex items-center gap-2">
          {onReset && (
            <button onClick={onReset} className="neo-btn text-xs py-2 bg-card">
              <RotateCcw size={16} strokeWidth={2.5} />
              Buat Lagi
            </button>
          )}
          <button onClick={() => setCoverModalOpen(true)} className="neo-btn text-xs py-2 bg-card">
            <ImageIcon size={16} strokeWidth={2.5} />
            Cover Prompt
          </button>
          <button onClick={handleExport} className="neo-btn-primary text-xs py-2">
            <Download size={18} strokeWidth={2.5} />
            Download Word
          </button>
        </div>
      </div>

      {/* A4 document */}
      <div className="flex-1 overflow-auto p-4 md:p-8 bg-muted/50">
        <div ref={docRef} className="a4-page text-sm leading-relaxed">
          {/* Header */}
          <div className="text-center mb-6 border-b-2 border-black pb-4">
            <h1 className="text-xl font-bold uppercase mb-1">Rencana Kegiatan Ko-Kurikuler</h1>
            <h2 className="text-lg font-bold">{formData.sekolah || "Nama Sekolah"}</h2>
            <p className="text-sm">{formData.jenjang}</p>
            <p className="text-xs mt-1">Tahun Ajaran: {formData.tahunAjaran}</p>
          </div>

          {/* Summary Table */}
          <table className="w-full border-collapse mb-6 text-xs">
            <tbody>
              <tr>
                <td className="border border-black p-2 font-bold bg-gray-100 w-1/4">Fase / Kelas</td>
                <td className="border border-black p-2 w-1/4">{formData.fase ? `${formData.fase} - ` : ""}{formData.kelas}</td>
                <td className="border border-black p-2 font-bold bg-gray-100 w-1/4">Alokasi Waktu</td>
                <td className="border border-black p-2 w-1/4">{formData.waktu}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-gray-100">Tema</td>
                <td className="border border-black p-2">{temaDisplay}</td>
                <td className="border border-black p-2 font-bold bg-gray-100">Rencana Waktu</td>
                <td className="border border-black p-2">{formData.rencanaWaktu}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-gray-100">Bentuk Kegiatan</td>
                <td className="border border-black p-2" colSpan={3}>
                  {formData.jenis}{formData.jenisLain ? ` (${formData.jenisLain})` : ""}
                  {formData.detail7kaih?.length > 0 && ` | 7KAIH: ${formData.detail7kaih.join(", ")}`}
                  {formData.lintasMapel && ` | Terintegrasi: ${formData.lintasMapel}`}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-gray-100">Judul Kegiatan</td>
                <td className="border border-black p-2" colSpan={3}>{formData.judul}</td>
              </tr>
              {formData.praktikPedagogis && (
                <tr>
                  <td className="border border-black p-2 font-bold bg-gray-100">Praktik Pedagogis</td>
                  <td className="border border-black p-2" colSpan={3}>{content.praktikPedagogisDesc}</td>
                </tr>
              )}
              {formData.jenisAktivitas?.length > 0 && (
                <tr>
                  <td className="border border-black p-2 font-bold bg-gray-100">Jenis Aktivitas</td>
                  <td className="border border-black p-2" colSpan={3}>{formData.jenisAktivitas.join(", ")}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Section A */}
          <div className="section mb-6">
            <h2 className="text-base font-bold border-b-2 border-black pb-1 mb-3">A. DIMENSI PROFIL LULUSAN</h2>
            {Object.entries(formData.dimensi || {}).length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {Object.entries(formData.dimensi).map(([dim, inds]) => (
                  <li key={dim}><strong>{dim}:</strong> {inds.join("; ")}.</li>
                ))}
              </ul>
            ) : <p className="italic text-gray-500">Belum ada dimensi yang dipilih.</p>}
          </div>

          {/* Section B */}
          <div className="section mb-6">
            <h2 className="text-base font-bold border-b-2 border-black pb-1 mb-3">B. TUJUAN PEMBELAJARAN</h2>
            <ol className="list-decimal pl-5 space-y-1">
              {content.tujuan.map((t, i) => <li key={i}>{t}</li>)}
            </ol>
          </div>

          {/* Section C */}
          <div className="section mb-6">
            <h2 className="text-base font-bold border-b-2 border-black pb-1 mb-3">C. LINGKUNGAN & METODE</h2>
            <p><strong>Praktik Pedagogis:</strong> {content.praktikPedagogisDesc}</p>
            <p><strong>Lingkungan Belajar:</strong> {content.lingkunganDesc}</p>
            <p><strong>Mitra Kerjasama:</strong> {formData.kemitraan.length > 0 ? formData.kemitraan.join(", ") : "-"}</p>
            <p><strong>Teknologi Digital:</strong> {formData.digital.length > 0 ? formData.digital.join(", ") : "-"}</p>
            {formData.jenisAktivitas?.length > 0 && (
              <p><strong>Jenis Aktivitas:</strong> {formData.jenisAktivitas.join(", ")}</p>
            )}
          </div>

          {/* Section D */}
          <div className="section mb-6">
            <h2 className="text-base font-bold border-b-2 border-black pb-1 mb-3">D. ALUR KEGIATAN</h2>
            {content.langkahDetail.map((phase, idx) => (
              <div key={idx} className="mb-3">
                <h3 className="font-bold text-sm">{phase.title}</h3>
                <ul className="list-disc pl-5">
                  {phase.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>

          {/* Section E */}
          <div className="section mb-6">
            <h2 className="text-base font-bold border-b-2 border-black pb-1 mb-3">E. ASESMEN & EVALUASI</h2>

            {/* LKPD */}
            <h3 className="font-bold text-sm mt-4 mb-2">1. Lembar Kerja Peserta Didik (LKPD)</h3>
            <div className="border border-black p-4 mb-4">
              <p className="font-bold text-center mb-2">LKPD: {formData.judul}</p>
              <p className="text-xs mb-1">Nama Kelompok: ...........................................................</p>
              <p className="text-xs mb-3">Anggota: 1).......... 2).......... 3).......... 4)..........</p>

              <p className="font-bold text-xs mb-2">A. Langkah Pengerjaan:</p>
              {content.instruksiLKPD.map((s, i) => (
                <div key={i} className="mb-2">
                  <p className="font-semibold text-xs">{s.step}</p>
                  <p className="text-xs pl-3">{s.detail}</p>
                </div>
              ))}

              <p className="font-bold text-xs mb-2 mt-3">B. Soal Uraian:</p>
              <ol className="list-decimal pl-5 text-xs space-y-1">
                {content.soalUraian.map((q, i) => <li key={i}>{q}</li>)}
              </ol>
            </div>

            {/* Rubrik 4 Tingkat SB/B/C/K */}
            <h3 className="font-bold text-sm mt-4 mb-2">2. Rubrik Penilaian</h3>
            {Object.entries(formData.dimensi || {}).length > 0 ? (
              <table className="w-full border-collapse text-xs mb-4">
                <thead>
                  <tr>
                    <th className="border border-black p-2 bg-gray-100" rowSpan={2}>Indikator</th>
                    <th className="border border-black p-2 bg-gray-100 text-center" colSpan={4}>Penilaian</th>
                  </tr>
                  <tr>
                    {rubrikSkala.map(s => (
                      <th key={s.kode} className="border border-black p-1 bg-gray-50 text-center text-[10px]">
                        {s.kode}<br /><span className="font-normal">({s.label})</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(formData.dimensi).map(([dim, inds]) => (
                    <>
                      <tr key={dim}>
                        <td className="border border-black p-2 font-bold bg-gray-50" colSpan={5}>{dim}</td>
                      </tr>
                      {inds.map((ind, i) => (
                        <tr key={`${dim}-${i}`}>
                          <td className="border border-black p-2">{ind}</td>
                          {rubrikSkala.map(s => (
                            <td key={s.kode} className="border border-black p-2 text-center">☐</td>
                          ))}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            ) : <p className="italic text-gray-500 text-xs">Belum ada rubrik.</p>}

            <div className="text-[10px] text-gray-500 mb-4">
              <p className="font-bold">Keterangan Skala Penilaian:</p>
              {rubrikSkala.map(s => (
                <p key={s.kode}><strong>{s.kode} ({s.label}):</strong> {s.deskripsi}</p>
              ))}
            </div>

            {/* Bahan Bacaan */}
            <h3 className="font-bold text-sm mt-4 mb-2">3. Bahan Bacaan Pendukung</h3>
            {content.articles.map((article, idx) => (
              <div key={idx} className="mb-3 border border-gray-300 p-3 rounded">
                <p className="font-bold text-xs">{article.title}</p>
                {article.source && <p className="text-[10px] text-gray-500 italic mb-1">Sumber: {article.source}</p>}
                <ul className="list-disc pl-4 text-xs space-y-0.5">
                  {article.points.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>

          {/* Glosarium */}
          <div className="section mb-6">
            <h2 className="text-base font-bold border-b-2 border-black pb-1 mb-3">GLOSARIUM</h2>
            <ul className="list-disc pl-5 text-xs space-y-1">
              <li><strong>Kokurikuler:</strong> Kegiatan yang dirancang untuk memperkuat pencapaian kompetensi dan karakter melalui Profil Pelajar Pancasila.</li>
              <li><strong>7KAIH:</strong> Tujuh Kebiasaan Anak Indonesia Hebat — gerakan pembiasaan positif bagi peserta didik.</li>
              <li><strong>Asesmen Autentik:</strong> Penilaian yang mengukur kinerja nyata peserta didik dalam konteks bermakna.</li>
              <li><strong>{temaDisplay}:</strong> Fokus utama pembahasan dalam kegiatan kokurikuler ini.</li>
            </ul>
          </div>

          {/* Daftar Pustaka */}
          <div className="section mb-6">
            <h2 className="text-base font-bold border-b-2 border-black pb-1 mb-3">DAFTAR PUSTAKA</h2>
            <ol className="list-decimal pl-5 text-xs space-y-1">
              <li>Kemendikbudristek. (2024). <em>Panduan Kokurikuler Kurikulum Merdeka</em>. Jakarta: Badan Standar, Kurikulum, dan Asesmen Pendidikan.</li>
              <li>Kemendikbudristek. (2024). <em>Kerangka Kurikulum Merdeka</em>. Jakarta: BSKAP Kemdikbudristek.</li>
              <li>Platform Merdeka Mengajar. <em>https://guru.kemdikbud.go.id</em>. Diakses 2025.</li>
            </ol>
          </div>

          {/* Tanda Tangan */}
          <div className="mt-12">
            <table className="w-full text-xs">
              <tbody>
                <tr>
                  <td className="w-1/2 text-center align-top p-4">
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala Sekolah</p>
                    <div className="h-16" />
                    <p className="border-t border-black inline-block px-4 pt-1">{formData.kepalaSekolah || "____________________"}</p>
                    <p>NIP. {formData.nipKepala || ".................."}</p>
                  </td>
                  <td className="w-1/2 text-center align-top p-4">
                    <p>Jakarta, ..................... 2026</p>
                    <p className="font-bold">Koordinator Ko-Kurikuler</p>
                    <div className="h-16" />
                    <p className="border-t border-black inline-block px-4 pt-1">{formData.koordinator || "____________________"}</p>
                    <p>NIP. {formData.nipKoordinator || ".................."}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <CoverPromptModal open={coverModalOpen} onOpenChange={setCoverModalOpen} formData={formData} />
    </div>
  );
}
