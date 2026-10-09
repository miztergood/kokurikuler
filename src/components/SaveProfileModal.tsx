import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSaveTeacherProfile } from "@/hooks/useTeacherProfiles";
import { toast } from "sonner";
import { phases, alokasiWaktu, jenjangOptions, faseKelasMap } from "@/lib/constants";

interface SaveProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingNames: string[];
  onSave: (name: string, data: Record<string, string | string[]>) => void;
}

const TEXT_FIELDS: Record<string, string> = {
  sekolah: "Nama Sekolah",
  kepalaSekolah: "Kepala Sekolah",
  nipKepala: "NIP Kepala Sekolah",
  koordinator: "Koordinator Kokurikuler",
  nipKoordinator: "NIP Koordinator",
};

const jenjangPhaseMap: Record<string, string[]> = {
  SD: ["A", "B", "C"],
  SMP: ["D"],
  SMA: ["E", "F"],
  SMK: ["E", "F"],
};

export function SaveProfileModal({ open, onOpenChange, existingNames, onSave }: SaveProfileModalProps) {
  const [name, setName] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({
    sekolah: "", kepalaSekolah: "", nipKepala: "", koordinator: "", nipKoordinator: "", fase: "", kelas: "", jenjang: "",
  });
  const saveMutation = useSaveTeacherProfile();

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) { toast.error("Nama profil wajib diisi"); return; }
    if (existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Nama profil sudah ada"); return;
    }
    try {
      await saveMutation.mutateAsync({ name: trimmed, data: fields });
      onSave(trimmed, fields);
      setName("");
      setFields({ sekolah: "", kepalaSekolah: "", nipKepala: "", koordinator: "", nipKoordinator: "", fase: "", kelas: "", jenjang: "" });
      toast.success("Profil baru berhasil dibuat!");
    } catch {
      toast.error("Gagal menyimpan profil");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-extrabold">
            <Plus size={18} className="text-primary" /> Buat Profil Baru
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold">Nama Profil <span className="text-primary">*</span></label>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="Contoh: SDN 1 Semarang" className="h-9 text-sm border-2 border-foreground" />
          </div>

          <div className="border-t-2 border-foreground/10 pt-3">
            <span className="text-xs font-bold text-muted-foreground uppercase">Data Identifikasi</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(TEXT_FIELDS).map(([key, label]) => (
                <div key={key} className={key === "sekolah" ? "col-span-2" : ""}>
                  <label className="text-[11px] font-semibold">{label}</label>
                  <Input
                    value={fields[key]}
                    onChange={(e) => setFields((p) => ({ ...p, [key]: e.target.value }))}
                    className="h-9 text-sm border-2 border-foreground/50"
                  />
                </div>
              ))}
              <div>
                <label className="text-[11px] font-semibold">Jenjang</label>
                <select
                  value={fields.jenjang || ""}
                  onChange={(e) => setFields((p) => ({ ...p, jenjang: e.target.value, fase: "", kelas: "" }))}
                  className="neo-input h-11 text-sm w-full"
                >
                  <option value="">Pilih</option>
                  {jenjangOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold">Fase</label>
                <select
                  value={fields.fase || ""}
                  onChange={(e) => setFields((p) => ({ ...p, fase: e.target.value, kelas: "" }))}
                  className="neo-input h-11 text-sm w-full"
                >
                  <option value="">Pilih</option>
                  {(fields.jenjang ? phases.filter(p => jenjangPhaseMap[fields.jenjang]?.includes(p.value)) : phases).map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold">Kelas</label>
                <select
                  value={fields.kelas || ""}
                  onChange={(e) => setFields((p) => ({ ...p, kelas: e.target.value }))}
                  className="neo-input h-11 text-sm w-full"
                >
                  <option value="">Pilih Kelas</option>
                  {(fields.fase && faseKelasMap[fields.fase]
                    ? faseKelasMap[fields.fase]
                    : (fields.jenjang && alokasiWaktu[fields.jenjang]
                      ? Object.keys(alokasiWaktu[fields.jenjang])
                      : [])
                  ).map(k => <option key={k} value={k}>Kelas {k}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>Simpan Profil</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
