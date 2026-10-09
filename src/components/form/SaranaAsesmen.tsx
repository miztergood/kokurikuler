import { Monitor } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { InputWrapper } from "./InputWrapper";
import { FormData, lingkunganOptions, digitalTools, kemitraanOptions, asesmenFormatifOptions, asesmenSumatifOptions } from "@/lib/constants";

interface Props {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  onCheckboxGroup: (field: keyof FormData, value: string) => void;
}

export function SaranaAsesmen({ formData, onChange, onCheckboxGroup }: Props) {
  return (
    <div className="neo-card mb-4">
      <SectionHeader title="3. Sarana & Asesmen" icon={Monitor} />

      <InputWrapper label="Lingkungan Belajar">
        <select className="neo-input" value={formData.lingkungan} onChange={e => onChange("lingkungan", e.target.value)}>
          <option value="">Pilih</option>
          {lingkunganOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </InputWrapper>

      <InputWrapper label="Pemanfaatan Teknologi Digital">
        <div className="flex flex-wrap gap-3">
          {digitalTools.map(d => (
            <label key={d} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" checked={(formData.digital || []).includes(d)} onChange={() => onCheckboxGroup("digital", d)} className="w-4 h-4 accent-primary" />
              {d}
            </label>
          ))}
        </div>
      </InputWrapper>

      <InputWrapper label="Kemitraan (Catur Pusat Pendidikan)">
        <div className="flex flex-wrap gap-3">
          {kemitraanOptions.map(k => (
            <label key={k} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" checked={(formData.kemitraan || []).includes(k)} onChange={() => onCheckboxGroup("kemitraan", k)} className="w-4 h-4 accent-primary" />
              {k}
            </label>
          ))}
        </div>
      </InputWrapper>

      <InputWrapper label="Asesmen Formatif">
        <div className="flex flex-wrap gap-3">
          {asesmenFormatifOptions.map(a => (
            <label key={a} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" checked={(formData.asesmenFormatif || []).includes(a)} onChange={() => onCheckboxGroup("asesmenFormatif", a)} className="w-4 h-4 accent-primary" />
              {a}
            </label>
          ))}
        </div>
      </InputWrapper>

      <InputWrapper label="Asesmen Sumatif">
        <div className="flex flex-wrap gap-3">
          {asesmenSumatifOptions.map(a => (
            <label key={a} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" checked={(formData.asesmenSumatif || []).includes(a)} onChange={() => onCheckboxGroup("asesmenSumatif", a)} className="w-4 h-4 accent-primary" />
              {a}
            </label>
          ))}
        </div>
      </InputWrapper>
    </div>
  );
}
