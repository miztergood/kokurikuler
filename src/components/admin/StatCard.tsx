import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorClass?: string;
}

export function StatCard({ label, value, icon: Icon, colorClass = "bg-primary/10 text-primary" }: StatCardProps) {
  return (
    <div className="neo-card-hover relative overflow-hidden">
      <div className={`absolute top-3 right-3 p-2 rounded-xl ${colorClass}`}>
        <Icon size={20} />
      </div>
      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}
