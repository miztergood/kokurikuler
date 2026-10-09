import { useState } from "react";
import { useDemoApiKeys, useAddDemoApiKey, useToggleDemoApiKey, useDeleteDemoApiKey } from "@/hooks/useDemoApiKeys";
import { Key, Plus, Trash2, ToggleLeft, ToggleRight, Info } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: demoKeys = [] } = useDemoApiKeys();
  const addKey = useAddDemoApiKey();
  const toggleKey = useToggleDemoApiKey();
  const deleteKey = useDeleteDemoApiKey();

  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const handleAddDemoKey = async () => {
    if (!newKey.trim()) { toast.error("API Key wajib diisi"); return; }
    await addKey.mutateAsync({ api_key: newKey.trim(), label: newLabel.trim() || undefined });
    toast.success("Demo key ditambahkan");
    setNewKey("");
    setNewLabel("");
  };

  const maskKey = (key: string) => "••••••••" + key.slice(-8);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">Konfigurasi Demo API Keys untuk sistem</p>
      </div>

      {/* Demo API Keys */}
      <div className="neo-card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-info/10 text-info"><Key size={20} /></div>
          <div>
            <h2 className="font-bold">Demo API Keys</h2>
            <p className="text-xs text-muted-foreground">Key Gemini untuk user tanpa key pribadi (round-robin)</p>
          </div>
        </div>

        {/* Add form */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="API Key" className="neo-input flex-1 min-w-[200px]" />
          <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Label (opsional)" className="neo-input w-32" />
          <button onClick={handleAddDemoKey} disabled={addKey.isPending} className="neo-btn-primary text-sm"><Plus size={14} /> Tambah</button>
        </div>

        {/* List */}
        <div className="space-y-2">
          {demoKeys.map((k, i) => (
            <div key={k.id} className="flex items-center gap-3 p-3 border-2 border-foreground/20 rounded-xl">
              <span className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono truncate">{maskKey(k.api_key)}</p>
                {k.label && <p className="text-[10px] text-muted-foreground">{k.label}</p>}
              </div>
              <button
                onClick={() => toggleKey.mutate({ id: k.id, is_active: !k.is_active })}
                className={`p-1 rounded ${k.is_active ? "text-success" : "text-muted-foreground"}`}
                title={k.is_active ? "Aktif" : "Nonaktif"}
              >
                {k.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              </button>
              <button onClick={() => deleteKey.mutate(k.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {demoKeys.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Belum ada demo key</p>}
        </div>
      </div>

      {/* Info */}
      <div className="bg-info/10 border-2 border-info/30 rounded-xl p-4 text-sm">
        <div className="flex gap-2">
          <Info size={16} className="text-info flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-info mb-1">Tentang Demo Keys</p>
            <p className="text-muted-foreground text-xs">
              Pengguna yang belum memasukkan API Key pribadi akan otomatis menggunakan Demo API Keys secara bergantian. Jika tidak ada demo key yang aktif, sistem tetap bisa digunakan dengan kapasitas terbatas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
