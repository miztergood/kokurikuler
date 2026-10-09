import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PURCHASE_LINK = "https://kokurikuler.online/beli";

const checklist = [
  "Program Tahunan Kokurikuler",
  "Modul Kokurikuler Lengkap",
  "Laporan Pelaksanaan Otomatis",
  "Asesmen Formatif & Sumatif",
  "Rubrik 4 Tingkat (SB/B/C/K)",
  "Materi Fasilitasi Guru",
  "Refleksi Siswa & Guru",
  "Export Word & PDF",
  "Cover Dokumen AI-Ready",
  "Sesuai Panduan Kemdikbud 2024",
];

const ProductShowcase = () => (
  <section className="py-12 md:py-20 bg-muted/30">
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Browser mockup */}
        <div className="order-2 lg:order-1 relative">
          <div className="border-2 border-foreground rounded-xl shadow-brutal bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b-2 border-foreground bg-muted/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive border border-foreground/20" />
                <div className="w-3 h-3 rounded-full bg-accent border border-foreground/20" />
                <div className="w-3 h-3 rounded-full bg-success border border-foreground/20" />
              </div>
              <div className="flex-1 ml-2 bg-muted rounded-md px-3 py-1 text-[10px] font-mono text-muted-foreground">
                kokurikuler.online/app
              </div>
            </div>
            <div className="flex border-b border-foreground/10 px-4">
              {["Kokurikuler", "Laporan", "Asesmen"].map((t, i) => (
                <div key={t} className={`px-3 py-2 text-xs font-bold border-b-2 ${i === 0 ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
                  {t}
                </div>
              ))}
            </div>
            <div className="p-4 md:p-6 space-y-3">
              <div className="h-5 w-2/3 bg-foreground/10 rounded" />
              <div className="flex gap-2 text-[10px] text-muted-foreground">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">Tema: Aku Cinta Indonesia</span>
                <span className="bg-success/10 text-success px-2 py-0.5 rounded font-bold">Fase D</span>
              </div>
              <div className="h-3 w-full bg-foreground/5 rounded" />
              <div className="h-3 w-5/6 bg-foreground/5 rounded" />
              <div className="h-3 w-4/6 bg-foreground/5 rounded" />
              <div className="h-px bg-foreground/10 my-2" />
              <div className="h-4 w-1/3 bg-foreground/10 rounded" />
              <div className="h-3 w-full bg-foreground/5 rounded" />
              <div className="h-3 w-3/4 bg-foreground/5 rounded" />
              <div className="flex gap-2 pt-2">
                <button className="neo-btn text-[10px] px-3 py-1.5 bg-info text-info-foreground">📄 Export Word</button>
                <button className="neo-btn text-[10px] px-3 py-1.5 bg-destructive/80 text-destructive-foreground">📑 Export PDF</button>
              </div>
            </div>
          </div>
          <div className="absolute -top-3 -right-3 hidden md:block bg-success text-success-foreground text-xs font-bold px-3 py-1 rounded-full border-2 border-foreground shadow-brutal-sm">
            Live Preview
          </div>
        </div>

        {/* Right content */}
        <div className="order-1 lg:order-2">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-3">
            Solusi Lengkap untuk <span className="text-primary">Guru Modern</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mb-6">
            Satu platform untuk semua kebutuhan dokumen proyek kokurikuler Anda.
          </p>
          <div className="grid sm:grid-cols-2 gap-2 mb-6">
            {checklist.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check size={16} className="text-success flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
          <a href={PURCHASE_LINK} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="border-2 border-foreground shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-base">
              Dapatkan Akses Sekarang <ArrowRight size={16} />
            </Button>
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default ProductShowcase;
