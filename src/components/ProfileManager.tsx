import { useState } from "react";
import { Save, Trash2, User } from "lucide-react";
import { useTeacherProfiles, useSaveTeacherProfile, useDeleteTeacherProfile } from "@/hooks/useTeacherProfiles";
import { IDENTIFIKASI_FIELDS, type FormData } from "@/lib/constants";
import { SaveProfileModal } from "./SaveProfileModal";
import { toast } from "sonner";

interface ProfileManagerProps {
  formData: FormData;
  selectedProfile: string;
  onSelectProfile: (name: string) => void;
  onLoadProfile: (data: Record<string, string | string[]>) => void;
}

export function ProfileManager({ formData, selectedProfile, onSelectProfile, onLoadProfile }: ProfileManagerProps) {
  const { data: profiles = [], isLoading } = useTeacherProfiles();
  const saveMutation = useSaveTeacherProfile();
  const deleteMutation = useDeleteTeacherProfile();
  const [showModal, setShowModal] = useState(false);

  const handleSelectChange = (value: string) => {
    if (value === "__create_new__") {
      setShowModal(true);
      return;
    }
    onSelectProfile(value);
    const profile = profiles.find((p) => p.name === value);
    if (profile) onLoadProfile(profile.data);
  };

  const handleSave = async () => {
    if (!selectedProfile) return;
    const data: Record<string, string | string[]> = {};
    for (const key of IDENTIFIKASI_FIELDS) {
      data[key] = formData[key] as string | string[];
    }
    try {
      await saveMutation.mutateAsync({ name: selectedProfile, data });
      toast.success("Profil berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan profil");
    }
  };

  const handleDelete = async () => {
    if (!selectedProfile || !window.confirm(`Hapus profil "${selectedProfile}"?`)) return;
    try {
      await deleteMutation.mutateAsync(selectedProfile);
      onSelectProfile("");
      toast.success("Profil berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus profil");
    }
  };

  const handleCreateSave = (name: string, data: Record<string, string | string[]>) => {
    onSelectProfile(name);
    onLoadProfile(data);
    setShowModal(false);
  };

  return (
    <>
      <div className="neo-card mb-4 bg-secondary border-muted-foreground/30 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-primary" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Profile Manager</span>
          </div>
          {selectedProfile && (
            <button onClick={handleDelete} className="p-1 hover:bg-destructive/10 rounded transition-colors" title="Hapus profil">
              <Trash2 size={14} className="text-destructive" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          <select
            value={selectedProfile}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="neo-input flex-1 h-11 text-xs"
            style={{ color: "hsl(160, 25%, 12%)", backgroundColor: "hsl(60, 20%, 99%)" }}
            disabled={isLoading}
          >
            <option value="">-- Pilih Profil --</option>
            <option value="__create_new__">+ Buat Profil Baru</option>
            {profiles.length > 0 && <option disabled>──────</option>}
            {profiles.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={handleSave}
            disabled={!selectedProfile || saveMutation.isPending}
            className="neo-btn py-1 px-2 text-xs bg-card disabled:opacity-40"
            title="Simpan profil"
          >
            <Save size={14} />
          </button>
        </div>
      </div>

      <SaveProfileModal
        open={showModal}
        onOpenChange={setShowModal}
        existingNames={profiles.map((p) => p.name)}
        onSave={handleCreateSave}
      />
    </>
  );
}
