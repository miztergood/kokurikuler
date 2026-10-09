import { Users, FileText, School, ThumbsUp } from "lucide-react";

const stats = [
  { icon: Users, value: "100+", label: "Guru Terdaftar", color: "bg-info/10 text-info" },
  { icon: FileText, value: "500+", label: "Dokumen Dibuat", color: "bg-success/10 text-success" },
  { icon: School, value: "50+", label: "Sekolah", color: "bg-purple-100 text-purple-600" },
  { icon: ThumbsUp, value: "98%", label: "Kepuasan", color: "bg-primary/10 text-primary" },
];

const StatsSection = () => (
  <section className="py-10 md:py-16 bg-muted/50 border-y-2 border-foreground/10">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center group">
            <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform`}>
              <s.icon size={22} />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold">{s.value}</p>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
