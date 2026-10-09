import { Brain, Clock, FileCheck, Zap, FileDown, BadgeCheck, Globe, Monitor } from "lucide-react";

const advantages = [
  { icon: Brain, title: "AI Cerdas", desc: "Didukung teknologi AI terdepan untuk menghasilkan konten berkualitas.", highlight: "Gemini 2.5 Pro" },
  { icon: Clock, title: "Hemat Waktu", desc: "Buat dokumen proyek dalam hitungan menit, bukan berjam-jam.", highlight: "Menit, Bukan Jam" },
  { icon: FileCheck, title: "Format Resmi", desc: "Dokumen otomatis mengikuti format sesuai Panduan Kokurikuler Kemdikbud 2024.", highlight: "Kemdikbud 2024" },
  { icon: Zap, title: "Dimensi Lengkap", desc: "Konten mendukung 8 Dimensi Profil Lulusan dan elemen kokurikuler.", highlight: "8 Dimensi Profil Lulusan" },
  { icon: FileDown, title: "Export Siap Pakai", desc: "Download langsung dalam format yang siap digunakan dan dicetak.", highlight: "Word & PDF" },
  { icon: BadgeCheck, title: "Sekali Beli", desc: "Akses seumur hidup tanpa biaya langganan bulanan.", highlight: "Tanpa Langganan" },
  { icon: Globe, title: "Berbasis Web", desc: "Gunakan langsung di browser tanpa perlu instalasi apapun.", highlight: "Tanpa Install" },
  { icon: Monitor, title: "Multi-Device", desc: "Akses dari perangkat manapun kapanpun dibutuhkan.", highlight: "Laptop, Tablet, HP" },
];

const WhyUsSection = () => (
  <section id="mengapa-kami" className="py-12 md:py-20 bg-primary">
    <div className="container mx-auto px-4">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2">Mengapa Kokurikuler Online?</h2>
        <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto">Solusi terbaik untuk guru di era digital.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {advantages.map((a) => (
          <div key={a.title} className="bg-card border-2 border-foreground rounded-xl p-3 md:p-5 shadow-brutal-sm hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <a.icon size={24} className="text-primary mb-2" />
            <p className="font-bold text-sm md:text-base mb-1">{a.title}</p>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2 md:line-clamp-none">{a.desc}</p>
            <span className="hidden md:inline-block bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded">{a.highlight}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyUsSection;
