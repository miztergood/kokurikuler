import { Layout, Calculator } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { InputWrapper } from "./InputWrapper";
import {
  FormData, jenjangOptions, phases, themeOptions, jenisOptions,
  lokasiOptions, jenisAktivitasOptions, praktikPedagogisOptions,
  detail7KAIH, alokasiWaktu, faseKelasMap, durasiJP,
} from "@/lib/constants";

interface Props {
  formData: FormData;
  onChange: (field: keyof FormData, value: string | string[]) => void;
  onCheckboxGroup: (field: keyof FormData, value: string) => void;
}

const jenjangPhaseMap: Record<string, string[]> = {
  SD: ["A", "B", "C"],
  SMP: ["D"],
  SMA: ["E", "F"],
  SMK: ["E", "F"],
};

function getAutoWaktu(jenjang: string, kelas: string): string {
  if (!jenjang || !kelas) return "";
  const jp = alokasiWaktu[jenjang]?.[kelas];
  return jp ? `${jp} JP / Tahun` : "";
}

function getJPNumber(waktuStr: string): number | null {
  const match = waktuStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export function InformasiUmum({ formData, onChange, onCheckboxGroup }: Props) {
  const autoWaktu = getAutoWaktu(formData.jenjang, formData.kelas);
  const effectiveWaktu = formData.waktu || autoWaktu;

  const filteredPhases = formData.jenjang
    ? phases.filter(p => jenjangPhaseMap[formData.jenjang]?.includes(p.value))
    : phases;

  const kelasOptions = formData.fase && faseKelasMap[formData.fase]
    ? faseKelasMap[formData.fase]
    : (formData.jenjang && alokasiWaktu[formData.jenjang]
      ? Object.keys(alokasiWaktu[formData.jenjang])
      : []);

  const handleJenjangChange = (val: string) => {
    onChange("jenjang", val);
    onChange("fase", "");
    onChange("kelas", "");
    onChange("waktu", "");
  };

  // JP calculation
  const totalJP = getJPNumber(effectiveWaktu);
  const jmlKegiatan = parseInt(formData.jumlahKegiatan, 10);
  const jmlPertemuan = parseInt(formData.jumlahPertemuan, 10);
  const menitPerJP = durasiJP[formData.jenjang] || 0;

  const canCalc = totalJP && jmlKegiatan > 0 && jmlPertemuan > 0 && menitPerJP > 0;
  const jpPerKegiatan = canCalc ? totalJP / jmlKegiatan : 0;
  const jpPerSesi = canCalc ? jpPerKegiatan / jmlPertemuan : 0;
  const menitPerSesi = canCalc ? Math.round(jpPerSesi * menitPerJP) : 0;

  return (
    <div className="neo-card mb-4">
      <SectionHeader title="1. Informasi Umum" icon={Layout} required />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <InputWrapper label="Nama Sekolah">
          <input className="neo-input" value={formData.sekolah} onChange={e => onChange("sekolah", e.target.value)} placeholder="Masukkan nama sekolah" />
        </InputWrapper>
        <InputWrapper label="Tahun Ajaran">
          <input className="neo-input" value={formData.tahunAjaran} onChange={e => onChange("tahunAjaran", e.target.value)} placeholder="2025/2026" />
        </InputWrapper>
        <InputWrapper label="Jenjang">
          <select className="neo-input" value={formData.jenjang} onChange={e => handleJenjangChange(e.target.value)}>
            <option value="">Pilih</option>
            {jenjangOptions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </InputWrapper>
        <InputWrapper label="Fase">
          <select className="neo-input" value={formData.fase} onChange={e => { onChange("fase", e.target.value); onChange("kelas", ""); }}>
            <option value="">Pilih</option>
            {filteredPhases.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </InputWrapper>
        <InputWrapper label="Kelas">
          <select className="neo-input" value={formData.kelas} onChange={e => onChange("kelas", e.target.value)}>
            <option value="">Pilih Kelas</option>
            {kelasOptions.map(k => <option key={k} value={k}>Kelas {k}</option>)}
          </select>
        </InputWrapper>
        <InputWrapper label="Alokasi Waktu">
          <input
            className="neo-input"
            value={formData.waktu || autoWaktu}
            onChange={e => onChange("waktu", e.target.value)}
            placeholder={autoWaktu || "Contoh: 4 x 35 menit"}
          />
          {autoWaktu && !formData.waktu && (
            <p className="text-[10px] text-primary mt-1">Auto-fill: {autoWaktu} (sesuai panduan resmi)</p>
          )}
        </InputWrapper>
        <InputWrapper label="Jumlah Kegiatan / Tahun">
          <input
            type="number"
            min="1"
            className="neo-input"
            value={formData.jumlahKegiatan}
            onChange={e => onChange("jumlahKegiatan", e.target.value)}
            placeholder="Contoh: 4"
          />
        </InputWrapper>
        <InputWrapper label="Jumlah Pertemuan / Kegiatan">
          <input
            type="number"
            min="1"
            className="neo-input"
            value={formData.jumlahPertemuan}
            onChange={e => onChange("jumlahPertemuan", e.target.value)}
            placeholder="Contoh: 3"
          />
        </InputWrapper>
      </div>

      {canCalc && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border mb-3">
          <Calculator className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div className="text-xs space-y-0.5">
            <p className="font-semibold text-foreground">
              📊 Estimasi: {jpPerKegiatan.toFixed(1)} JP/kegiatan → {jpPerSesi.toFixed(1)} JP/sesi (~{menitPerSesi} menit)
            </p>
            <p className="text-muted-foreground">
              Saran: Pendahuluan ~{Math.round(menitPerSesi * 0.15)} menit, Inti ~{Math.round(menitPerSesi * 0.7)} menit, Penutup ~{Math.round(menitPerSesi * 0.15)} menit
            </p>
            <p className="text-muted-foreground text-[10px]">
              Berdasarkan {totalJP} JP/tahun ÷ {jmlKegiatan} kegiatan ÷ {jmlPertemuan} pertemuan × {menitPerJP} menit/JP
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <InputWrapper label="Rencana Pelaksanaan">
          <input className="neo-input" value={formData.rencanaWaktu} onChange={e => onChange("rencanaWaktu", e.target.value)} placeholder="Contoh: Semester 1" />
        </InputWrapper>
        <InputWrapper label="Bentuk Kegiatan">
          <select className="neo-input" value={formData.jenis} onChange={e => onChange("jenis", e.target.value)}>
            <option value="">Pilih Bentuk Kegiatan</option>
            {jenisOptions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </InputWrapper>
      </div>

      {formData.jenis === "Gerakan 7KAIH" && (
        <InputWrapper label="Detail 7KAIH (Kebiasaan Anak Indonesia Hebat)">
          <div className="flex flex-wrap gap-2">
            {detail7KAIH.map(item => (
              <label key={item} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData.detail7kaih || []).includes(item)}
                  onChange={() => onCheckboxGroup("detail7kaih", item)}
                  className="w-4 h-4 accent-primary"
                />
                {item}
              </label>
            ))}
          </div>
        </InputWrapper>
      )}

      {formData.jenis === "Cara Lainnya" && (
        <InputWrapper label="Keterangan Bentuk Kegiatan">
          <input className="neo-input" value={formData.jenisLain} onChange={e => onChange("jenisLain", e.target.value)} placeholder="Sebutkan bentuk kegiatan" />
        </InputWrapper>
      )}

      <InputWrapper label="Tema Kegiatan" required>
        <select className="neo-input" value={formData.tema} onChange={e => onChange("tema", e.target.value)}>
          <option value="">Pilih Tema</option>
          {themeOptions.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </InputWrapper>

      {formData.tema === "Tema Lainnya (Konteks Lokal)" && (
        <InputWrapper label="Tema Konteks Lokal">
          <input className="neo-input" value={formData.temaLokal} onChange={e => onChange("temaLokal", e.target.value)} placeholder="Sebutkan tema konteks lokal" />
        </InputWrapper>
      )}

      <InputWrapper label="Terintegrasi Mapel">
        <input className="neo-input" value={formData.lintasMapel} onChange={e => onChange("lintasMapel", e.target.value)} placeholder="Contoh: IPA, IPS" />
      </InputWrapper>

      <InputWrapper label="Judul Spesifik" required>
        <input className="neo-input" value={formData.judul} onChange={e => onChange("judul", e.target.value)} placeholder="Judul kegiatan ko-kurikuler" />
      </InputWrapper>

      <InputWrapper label="Praktik Pedagogis">
        <select className="neo-input" value={formData.praktikPedagogis} onChange={e => onChange("praktikPedagogis", e.target.value)}>
          <option value="">Pilih Praktik Pedagogis</option>
          {praktikPedagogisOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </InputWrapper>

      <InputWrapper label="Jenis Aktivitas">
        <div className="flex flex-wrap gap-2">
          {jenisAktivitasOptions.map(a => (
            <label key={a} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={(formData.jenisAktivitas || []).includes(a)}
                onChange={() => onCheckboxGroup("jenisAktivitas", a)}
                className="w-4 h-4 accent-primary"
              />
              {a}
            </label>
          ))}
        </div>
      </InputWrapper>

      <InputWrapper label="Lokasi Praktik">
        <div className="flex flex-wrap gap-3">
          {lokasiOptions.map(loc => (
            <label key={loc} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" checked={(formData.lokasi || []).includes(loc)} onChange={() => onCheckboxGroup("lokasi", loc)} className="w-4 h-4 accent-primary" />
              {loc}
            </label>
          ))}
        </div>
      </InputWrapper>
    </div>
  );
}
