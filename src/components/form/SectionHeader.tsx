import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  required?: boolean;
}

export function SectionHeader({ title, icon: Icon, required }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center gap-2 flex-1">
        {Icon && <Icon size={20} strokeWidth={2.5} className="text-primary" />}
        <h3 className="font-display font-bold text-lg uppercase tracking-wide">{title}</h3>
      </div>
      {required && (
        <span className="neo-badge bg-primary text-primary-foreground text-[10px]">Wajib</span>
      )}
    </div>
  );
}
