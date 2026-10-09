import { PenTool } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { InputWrapper } from "./InputWrapper";
import { FormData } from "@/lib/constants";

interface Props {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}

export function Otorisasi({ formData, onChange }: Props) {
  return (
    <div className="neo-card mb-4">
      <SectionHeader title="4. Otorisasi" icon={PenTool} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <div>
          <p className="font-bold text-sm mb-2 uppercase tracking-wide">Kepala Sekolah</p>
          <InputWrapper label="Nama">
            <input className="neo-input" value={formData.kepalaSekolah} onChange={e => onChange("kepalaSekolah", e.target.value)} />
          </InputWrapper>
          <InputWrapper label="NIP">
            <input className="neo-input" value={formData.nipKepala} onChange={e => onChange("nipKepala", e.target.value)} />
          </InputWrapper>
        </div>
        <div>
          <p className="font-bold text-sm mb-2 uppercase tracking-wide">Koordinator</p>
          <InputWrapper label="Nama">
            <input className="neo-input" value={formData.koordinator} onChange={e => onChange("koordinator", e.target.value)} />
          </InputWrapper>
          <InputWrapper label="NIP">
            <input className="neo-input" value={formData.nipKoordinator} onChange={e => onChange("nipKoordinator", e.target.value)} />
          </InputWrapper>
        </div>
      </div>
    </div>
  );
}
