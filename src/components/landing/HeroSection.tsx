import { Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PURCHASE_URL = "https://aidukasi.shop/checkout?id=PRD-15";

const HeroSection = () => {
  const handleGetAccess = () => window.open(PURCHASE_URL, "_blank");

  return (
    <section className="relative overflow-hidden py-12 md:py-20 lg:py-28">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border-2 border-primary/30 rounded-full text-xs font-bold text-primary mb-4">
              <Zap size={14} /> Cepat & Mudah
            </span>
            <h1 className="font-extrabold text-3xl md:text-5xl lg:text-6xl leading-tight mb-4">
              Generator Dokumen <span className="text-primary">Kokurikuler</span> Profesional
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mb-6 max-w-lg mx-auto lg:mx-0">
              Buat program tahunan, modul, laporan, asesmen, dan rubrik proyek kokurikuler secara otomatis dengan AI — sesuai Panduan Kokurikuler Kemdikbud 2024.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
              <Button size="lg" className="border-2 border-foreground shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all w-full sm:w-auto text-base px-8" onClick={handleGetAccess}>
                Dapatkan Akses <ArrowRight size={16} />
              </Button>
              <a href="#fitur">
                <Button size="lg" variant="outline" className="border-2 border-foreground shadow-brutal-sm hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all w-full sm:w-auto text-base">
                  Pelajari Lebih Lanjut
                </Button>
              </a>
            </div>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start text-xs font-bold text-muted-foreground">
              <span>✓ Untuk SD, SMP, SMA, SMK</span>
              <span>✓ Export PDF & Word</span>
              <span>✓ Panduan Kemdikbud 2024</span>
            </div>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute -top-8 -right-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            <div className="hidden md:block absolute -bottom-8 -left-8 w-24 h-24 bg-accent/30 rounded-full blur-2xl" />
            <div className="border-2 border-foreground rounded-xl shadow-brutal bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b-2 border-foreground bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive border border-foreground/20" />
                  <div className="w-3 h-3 rounded-full bg-accent border border-foreground/20" />
                  <div className="w-3 h-3 rounded-full bg-success border border-foreground/20" />
                </div>
                <span className="text-xs text-muted-foreground ml-2 font-mono">kokurikuler.online</span>
              </div>
              <div className="flex border-b-2 border-foreground/10 px-4">
                {["Kokurikuler", "Laporan", "Asesmen", "Refleksi"].map((t, i) => (
                  <div key={t} className={`px-3 py-2 text-xs font-bold border-b-2 ${i === 0 ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
                    {t}
                  </div>
                ))}
              </div>
              <div className="p-4 md:p-6 space-y-3">
                <div className="h-5 w-3/4 bg-foreground/10 rounded" />
                <div className="h-3 w-full bg-foreground/5 rounded" />
                <div className="h-3 w-5/6 bg-foreground/5 rounded" />
                <div className="h-3 w-4/6 bg-foreground/5 rounded" />
                <div className="h-px bg-foreground/10 my-4" />
                <div className="h-4 w-1/2 bg-foreground/10 rounded" />
                <div className="h-3 w-full bg-foreground/5 rounded" />
                <div className="h-3 w-3/4 bg-foreground/5 rounded" />
                <div className="pt-4">
                  <button className="neo-btn-primary text-xs px-4 py-2">✨ Generate Otomatis</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
