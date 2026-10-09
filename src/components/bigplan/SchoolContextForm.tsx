import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InputWrapper } from "@/components/form/InputWrapper";
import {
  jenjangOptions, phases, faseKelasMap, alokasiWaktu,
} from "@/lib/constants";
import {
  geografisOptions, ekonomiOptions,
  type SchoolContext,
} from "@/lib/bigPlanConstants";

const jenjangPhaseMap: Record<string, string[]> = {
  SD: ["A", "B", "C"],
  SMP: ["D"],
  SMA: ["E", "F"],
  SMK: ["E", "F"],
};

interface Props {
  context: SchoolContext;
  onChange: (ctx: SchoolContext) => void;
}

export function SchoolContextForm({ context, onChange }: Props) {
  const update = useCallback(
    (field: keyof SchoolContext, value: any) => {
      const next = { ...context, [field]: value };

      // Auto-calculate totalJP and jumlahTema when jenjang/kelas changes
      if (field === "jenjang" || field === "kelas") {
        const j = field === "jenjang" ? value : context.jenjang;
        const k = field === "kelas" ? value : context.kelas;
        if (j && k && alokasiWaktu[j]?.[k]) {
          next.totalJP = alokasiWaktu[j][k];
          next.jumlahTema = Math.max(1, Math.round(next.totalJP / 25));
        }
      }
      // Re-calculate default jumlahTema when totalJP changes manually
      if (field === "totalJP" && !context.jumlahTema) {
        next.jumlahTema = Math.max(1, Math.round((parseInt(value) || 0) / 25));
      }

      // Reset kelas when fase changes
      if (field === "fase") {
        next.kelas = "";
      }
      if (field === "jenjang") {
        next.fase = "";
        next.kelas = "";
      }

      onChange(next);
    },
    [context, onChange]
  );

  const toggleEkonomi = (val: string) => {
    const arr = context.ekonomi || [];
    update(
      "ekonomi",
      arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
    );
  };

  const availablePhases = context.jenjang
    ? phases.filter((p) => jenjangPhaseMap[context.jenjang]?.includes(p.value))
    : phases;

  const availableKelas = context.fase && faseKelasMap[context.fase]
    ? faseKelasMap[context.fase]
    : context.jenjang && alokasiWaktu[context.jenjang]
      ? Object.keys(alokasiWaktu[context.jenjang])
      : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🏫</span>
        <h3 className="font-display font-bold text-lg uppercase tracking-wide">Konteks Sekolah</h3>
      </div>

      <InputWrapper label="Nama Sekolah" required>
        <Input
          value={context.sekolah}
          onChange={(e) => update("sekolah", e.target.value)}
          placeholder="SDN 1 Semarang"
          className="neo-input"
        />
      </InputWrapper>

      <InputWrapper label="Tahun Ajaran" required>
        <Input
          value={context.tahunAjaran}
          onChange={(e) => update("tahunAjaran", e.target.value)}
          placeholder="2025/2026"
          className="neo-input"
        />
      </InputWrapper>

      <div className="grid grid-cols-3 gap-2">
        <InputWrapper label="Jenjang" required>
          <select
            value={context.jenjang}
            onChange={(e) => update("jenjang", e.target.value)}
            className="neo-input h-11 text-sm w-full"
          >
            <option value="">Pilih</option>
            {jenjangOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </InputWrapper>
        <InputWrapper label="Fase" required>
          <select
            value={context.fase}
            onChange={(e) => update("fase", e.target.value)}
            className="neo-input h-11 text-sm w-full"
          >
            <option value="">Pilih</option>
            {availablePhases.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </InputWrapper>
        <InputWrapper label="Kelas" required>
          <select
            value={context.kelas}
            onChange={(e) => update("kelas", e.target.value)}
            className="neo-input h-11 text-sm w-full"
          >
            <option value="">Pilih</option>
            {availableKelas.map((k) => (
              <option key={k} value={k}>Kelas {k}</option>
            ))}
          </select>
        </InputWrapper>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <InputWrapper label="Total JP per Tahun">
          <Input
            type="number"
            value={context.totalJP || ""}
            onChange={(e) => update("totalJP", parseInt(e.target.value) || 0)}
            placeholder="252"
            className="neo-input"
          />
        </InputWrapper>
        <InputWrapper label="Jumlah Tema">
          <Input
            type="number"
            value={context.jumlahTema || ""}
            onChange={(e) => update("jumlahTema", parseInt(e.target.value) || 0)}
            placeholder="10"
            className="neo-input"
            min={1}
            max={20}
          />
        </InputWrapper>
      </div>
      {context.totalJP > 0 && context.jumlahTema > 0 && (
        <p className="text-xs text-muted-foreground -mt-2">
          Rekomendasi: ~{Math.floor(context.totalJP / context.jumlahTema)} JP × {context.jumlahTema} tema = {context.totalJP} JP
        </p>
      )}

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🌍</span>
        <h3 className="font-display font-bold text-lg uppercase tracking-wide">Konteks Lingkungan</h3>
      </div>

      <InputWrapper label="Kondisi Geografis" required>
        <select
          value={context.geografis}
          onChange={(e) => update("geografis", e.target.value)}
          className="neo-input h-11 text-sm w-full"
        >
          <option value="">Pilih Kondisi Geografis</option>
          {geografisOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </InputWrapper>

      <InputWrapper label="Potensi Ekonomi Lingkungan">
        <div className="flex flex-wrap gap-1.5">
          {ekonomiOptions.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => toggleEkonomi(o)}
              className={`neo-badge text-xs cursor-pointer transition-all ${
                context.ekonomi?.includes(o)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </InputWrapper>

      <InputWrapper label="Karakteristik Sosial & Budaya">
        <Textarea
          value={context.sosialBudaya}
          onChange={(e) => update("sosialBudaya", e.target.value)}
          placeholder="Contoh: Suku campuran Madura dan Jawa, budaya gotong royong kuat, mayoritas petani padi..."
          className="neo-input min-h-[80px]"
          rows={3}
        />
      </InputWrapper>
    </div>
  );
}
