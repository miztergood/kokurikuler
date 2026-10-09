import { Quote, Star } from "lucide-react";

const testimonials = [
  { name: "Ibu Sari Wulandari", role: "Guru SMA Negeri 1 Bandung", text: "Dengan Kokurikuler Online, saya bisa menyiapkan modul kokurikuler dalam 15 menit. Sebelumnya butuh 2-3 hari!", avatar: "👩‍🏫" },
  { name: "Bapak Ahmad Fauzi", role: "Guru SMP Islam Terpadu", text: "Rubrik penilaian yang dihasilkan sangat detail dan sesuai standar. Tinggal download dan pakai.", avatar: "👨‍🏫" },
  { name: "Ibu Dewi Ratna", role: "Koordinator Kokurikuler SDN 3 Jakarta", text: "Sangat membantu koordinator kurikulum yang harus menyiapkan banyak dokumen sekaligus.", avatar: "👩‍💼" },
  { name: "Bapak Hendra Saputra", role: "Guru SMK Negeri 2 Surabaya", text: "Fitur export Word sangat praktis. Dokumen langsung rapi dan siap diserahkan ke kepala sekolah.", avatar: "👨‍💻" },
  { name: "Ibu Nurul Hidayah", role: "Guru SD Muhammadiyah", text: "Asesmen formatif dan sumatif yang dihasilkan AI benar-benar berkualitas dan sesuai dimensi kokurikuler.", avatar: "👩‍🎓" },
  { name: "Bapak Rudi Hartono", role: "Wakasek Kurikulum SMAN 5", text: "Saya rekomendasikan ke seluruh guru di sekolah kami. Investasi yang sangat worth it!", avatar: "🧑‍💼" },
];

const TestimonialsSection = () => (
  <section id="testimoni" className="scroll-mt-20 py-12 md:py-20">
    <div className="container mx-auto px-4">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-4xl font-extrabold mb-2">Apa Kata Mereka?</h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">Dipercaya oleh guru-guru di seluruh Indonesia.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="border-2 border-foreground rounded-xl p-3 md:p-5 shadow-brutal-sm bg-card hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex flex-col">
            <Quote size={20} className="text-primary/30 mb-2" />
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground flex-1 line-clamp-3 md:line-clamp-none">"{t.text}"</p>
            <div className="border-t border-foreground/10 mt-3 pt-3 flex items-center gap-2">
              <span className="text-xl">{t.avatar}</span>
              <div>
                <p className="font-bold text-xs md:text-sm">{t.name}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
