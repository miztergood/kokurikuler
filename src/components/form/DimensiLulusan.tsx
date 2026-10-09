import { Users } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { FormData, dimensiData } from "@/lib/constants";

interface Props {
  formData: FormData;
  onDimensionChange: (dim: string, indicator: string) => void;
}

export function DimensiLulusan({ formData, onDimensionChange }: Props) {
  const selectedCount = Object.keys(formData.dimensi || {}).length;

  return (
    <div className="neo-card mb-4">
      <SectionHeader title="2. Dimensi Lulusan" icon={Users} />
      <p className="text-sm text-muted-foreground mb-3">
        Pilih Maksimal 3 Dimensi.{" "}
        <span className="font-bold text-primary">({selectedCount}/3 dipilih)</span>
      </p>

      <div className="space-y-3">
        {Object.entries(dimensiData).map(([dimName, indicators]) => {
          const isSelected = Object.keys(formData.dimensi || {}).includes(dimName);
          const isDisabled = !isSelected && selectedCount >= 3;

          return (
            <div key={dimName} className={`border-2 rounded-lg p-3 transition-all ${isSelected ? "border-primary bg-primary/5" : "border-foreground/20"} ${isDisabled ? "opacity-50" : ""}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm">{dimName}</h4>
                {isSelected && (
                  <span className="neo-badge bg-primary text-primary-foreground text-[10px]">Dipilih</span>
                )}
              </div>
              <div className="space-y-1">
                {indicators.map(ind => (
                  <label key={ind} className={`flex items-start gap-2 text-sm cursor-pointer ${isDisabled ? "pointer-events-none" : ""}`}>
                    <input
                      type="checkbox"
                      checked={(formData.dimensi?.[dimName] || []).includes(ind)}
                      onChange={() => onDimensionChange(dimName, ind)}
                      disabled={isDisabled && !isSelected}
                      className="w-4 h-4 accent-primary mt-0.5 flex-shrink-0"
                    />
                    <span>{ind}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
