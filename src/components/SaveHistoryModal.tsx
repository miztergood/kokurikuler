import { useState } from "react";
import { Save, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FormData, GeneratedContent } from "@/lib/constants";
import { useSaveContentHistory } from "@/hooks/useContentHistory";
import { toast } from "sonner";

interface SaveHistoryModalProps {
  open: boolean;
  onClose: () => void;
  formData: FormData;
  generatedContent: GeneratedContent | null;
  defaultName: string;
}

export function SaveHistoryModal({ open, onClose, formData, generatedContent, defaultName }: SaveHistoryModalProps) {
  const [name, setName] = useState(defaultName);
  const saveMutation = useSaveContentHistory();

  if (!open) return null;

  const contentItems = [
    { label: "Modul Ajar", available: !!generatedContent },
  ];
  const availableCount = contentItems.filter((c) => c.available).length;

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Nama riwayat wajib diisi"); return; }
    if (availableCount === 0) { toast.error("Tidak ada konten untuk disimpan"); return; }
    try {
      await saveMutation.mutateAsync({
        name: name.trim(),
        form_data: formData,
        modul_data: generatedContent,
      });
      toast.success("Riwayat konten berhasil disimpan!");
      onClose();
    } catch {
      toast.error("Gagal menyimpan riwayat");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl max-w-md w-full mx-4 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-1">
          <Save size={18} className="text-primary" />
          <h3 className="font-extrabold text-lg">Simpan Riwayat Konten</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Simpan semua konten yang sudah di-generate ke cloud.</p>

        <div className="mb-4">
          <label className="text-xs font-bold">Nama Riwayat <span className="text-primary">*</span></label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="h-9 text-sm border-2 border-foreground focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>

        <div className="mb-4 space-y-1.5">
          {contentItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs">
              {item.available ? (
                <Check size={14} className="text-green-600" />
              ) : (
                <X size={14} className="text-muted-foreground/50" />
              )}
              <span className={item.available ? "font-semibold" : "text-muted-foreground"}>
                {item.label} {item.available ? "(tersedia)" : "(belum digenerate)"}
              </span>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground mt-1">Konten yang akan disimpan ({availableCount}/1)</p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} size="sm">Batal</Button>
          <Button onClick={handleSave} disabled={!name.trim() || availableCount === 0 || saveMutation.isPending} size="sm">
            {saveMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</> : "Simpan Riwayat"}
          </Button>
        </div>
      </div>
    </div>
  );
}
