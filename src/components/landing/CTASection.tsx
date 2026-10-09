import { Sparkles, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const PURCHASE_URL = "https://aidukasi.shop/checkout?id=PRD-15";
const trustBadges = ["Akses Seumur Hidup", "Update Gratis", "Dukungan Penuh", "Panduan Kemdikbud 2024"];

const CTASection = () => {
  const handleGetAccess = () => window.open(PURCHASE_URL, "_blank");

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-info/5">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      <div className="container mx-auto px-4 relative z-10 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border-2 border-primary/30 rounded-full text-xs font-bold text-primary mb-4">
          <Sparkles size={14} /> Mulai Sekarang
        </span>
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold mb-4 max-w-2xl mx-auto">
          Siap Menyiapkan Proyek <span className="text-primary">Kokurikuler Berkualitas?</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-lg mb-8 max-w-xl mx-auto">
          Bergabung dengan ratusan guru yang sudah menghemat waktu dan menghasilkan dokumen proyek berkualitas tinggi.
        </p>
        <Button className="border-2 border-foreground shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-lg md:text-xl px-10 py-7 h-auto" onClick={handleGetAccess}>
          Dapatkan Akses <ArrowRight size={20} />
        </Button>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {trustBadges.map((b) => (
            <div key={b} className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-muted-foreground">
              <Check size={14} className="text-success" /> {b}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTASection;
