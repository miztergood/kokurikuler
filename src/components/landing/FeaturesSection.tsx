import { CalendarRange, BookOpen, FileText, ClipboardCheck, Database, GraduationCap, RefreshCw, Image } from "lucide-react";

const features = [
  { icon: CalendarRange, title: "Program Tahunan", desc: "Rancang program kokurikuler satu tahun penuh — distribusi tema, alokasi JP, dan dimensi profil lulusan dalam satu tabel. Langsung generate perencanaan detail per tema.", bg: "bg-amber-50", border: "border-amber-300" },
  { icon: BookOpen, title: "Modul Kokurikuler", desc: "Buat modul proyek lengkap dengan 6 tema resmi, 7KAIH, praktik pedagogis (Inquiry, PBL, PBM, Eksplorasi), dan alur kegiatan sesuai Panduan Kemdikbud 2024.", bg: "bg-info/10", border: "border-info/30" },
  { icon: FileText, title: "Laporan Proyek", desc: "Generate laporan pelaksanaan proyek otomatis dari data yang sudah diinput ke dalam form.", bg: "bg-success/10", border: "border-success/30" },
  { icon: ClipboardCheck, title: "Asesmen Kokurikuler", desc: "Buat instrumen asesmen formatif (Observasi, Jurnal, Interaksi Lisan) dan sumatif yang terstruktur untuk setiap tahap proyek.", bg: "bg-primary/10", border: "border-primary/30" },
  { icon: Database, title: "Rubrik Penilaian", desc: "Generate rubrik penilaian skala 4 tingkat (Sangat Berkembang, Berkembang, Cukup, Kurang) untuk setiap dimensi Profil Lulusan.", bg: "bg-purple-50", border: "border-purple-300" },
  { icon: GraduationCap, title: "Materi Fasilitasi", desc: "Dapatkan materi fasilitasi guru dengan kerangka Inquiry, PBL, PBM, dan Eksplorasi untuk membimbing siswa di setiap fase.", bg: "bg-accent/30", border: "border-accent" },
  { icon: RefreshCw, title: "Refleksi Proyek", desc: "Buat panduan refleksi untuk siswa dan guru dengan pertanyaan pemantik yang bermakna.", bg: "bg-teal-50", border: "border-teal-300" },
  { icon: Image, title: "Cover Dokumen", desc: "Buat cover dokumen modul yang menarik dengan berbagai pilihan style desain siap pakai.", bg: "bg-rose-50", border: "border-rose-300" },
];

const FeaturesSection = () => (
  <section id="fitur" className="scroll-mt-20 py-12 md:py-20">
    <div className="container mx-auto px-4">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-4xl font-extrabold mb-2">Fitur Lengkap untuk Proyek Kokurikuler</h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">Semua yang guru butuhkan untuk merencanakan dan melaksanakan proyek kokurikuler.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {features.map((f) => (
          <div key={f.title} className="border-2 border-foreground rounded-xl p-3 md:p-6 shadow-brutal bg-card hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${f.bg} border-2 ${f.border} flex items-center justify-center mb-3`}>
              <f.icon size={20} />
            </div>
            <p className="text-sm md:text-xl font-bold mb-1">{f.title}</p>
            <p className="text-xs md:text-base text-muted-foreground line-clamp-3 md:line-clamp-none">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
