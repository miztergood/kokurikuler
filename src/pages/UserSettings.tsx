import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Save, User, Key, Eye, EyeOff, Plus, Trash2,
  Power, PowerOff, CheckCircle, XCircle, AlertTriangle, Info, ExternalLink, Loader2, BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useUserApiKeys, useAddUserApiKey, useToggleUserApiKey, useDeleteUserApiKey } from "@/hooks/useUserApiKeys";
import { useEffect } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  quota_exceeded: "Quota API Key habis untuk hari ini",
  quota_unavailable: "Quota free tier belum aktif (limit: 0)",
  invalid_key: "API Key tidak valid",
  model_not_found: "Model tidak tersedia",
  bad_request: "Format API Key salah",
};

const GUIDE_STEPS = [
  { text: "Buka halaman pembuatan API Key di Google AI Studio", link: "https://aistudio.google.com/api-keys" },
  { text: 'Klik tombol "Create API Key"' },
  { text: "Pilih project Google Cloud (atau buat baru)" },
  { text: "Salin API Key yang ditampilkan" },
  { text: "Paste API Key di form di bawah ini" },
  { text: "Klik tombol Test Koneksi untuk memastikan key valid" },
];

const UserSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // API Key state
  const { data: apiKeys = [], isLoading: keysLoading } = useUserApiKeys();
  const addKey = useAddUserApiKey();
  const toggleKey = useToggleUserApiKey();
  const deleteKey = useDeleteUserApiKey();
  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [showNewKey, setShowNewKey] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string; errorCode?: string; model?: string } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, phone").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setDisplayName(data.display_name || "");
        setPhone(data.phone || "");
      }
    });
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName, phone, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    if (error) toast.error("Gagal menyimpan");
    else toast.success("Profil berhasil disimpan");
    setSaving(false);
  };

  const handleAddKey = async () => {
    if (!newKey.trim()) { toast.error("API Key wajib diisi"); return; }
    try {
      await addKey.mutateAsync({ api_key: newKey.trim(), label: newLabel.trim() || undefined });
      toast.success("API Key ditambahkan");
      setNewKey("");
      setNewLabel("");
      setShowNewKey(false);
    } catch {
      toast.error("Gagal menambahkan key");
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { type: "test", data: {} },
      });
      if (error) {
        setTestResult({ success: false, error: "Gagal menghubungi server" });
      } else {
        setTestResult(data);
      }
    } catch {
      setTestResult({ success: false, error: "Gagal menghubungi server" });
    }
    setTesting(false);
  };

  const maskKey = (key: string) => {
    if (key.length <= 12) return "••••••••";
    return key.slice(0, 6) + "••••••••" + key.slice(-4);
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/app")} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} /> Kembali ke Aplikasi
        </button>

        {/* Profile Section */}
        <div className="neo-card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
              <User className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">Pengaturan Profil</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase mb-1 block">Nama Tampilan</label>
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="neo-input" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase mb-1 block">No. Telepon</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="neo-input" placeholder="08xx..." />
            </div>
            <button onClick={handleSaveProfile} disabled={saving} className="neo-btn-primary w-full">
              <Save size={16} /> {saving ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </div>
        </div>

        {/* API Key Management */}
        <div className="neo-card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary"><Key size={20} /></div>
            <div>
              <h2 className="font-bold text-lg">API Key Gemini</h2>
              <p className="text-xs text-muted-foreground">Kelola API key untuk generasi konten AI</p>
            </div>
          </div>

          {/* Add key form */}
          <div className="space-y-2 mb-4">
            <div className="relative">
              <input
                type={showNewKey ? "text" : "password"}
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                placeholder="AIzaSy..."
                className="neo-input pr-10"
              />
              <button type="button" onClick={() => setShowNewKey(!showNewKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showNewKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex gap-2">
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Label (opsional)" className="neo-input flex-1" />
              <button onClick={handleAddKey} disabled={addKey.isPending} className="neo-btn-primary text-sm whitespace-nowrap">
                <Plus size={14} /> Tambah Key
              </button>
            </div>
          </div>

          {/* Key list */}
          <div className="space-y-2 mb-4">
            {keysLoading && <p className="text-sm text-muted-foreground text-center py-4">Memuat...</p>}
            {apiKeys.map((k, i) => (
              <div key={k.id} className="flex items-center gap-3 p-3 border-2 border-foreground/20 rounded-xl">
                <span className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono truncate">{visibleKeys.has(k.id) ? k.api_key : maskKey(k.api_key)}</p>
                  {k.label && <p className="text-[10px] text-muted-foreground">{k.label}</p>}
                </div>
                <button onClick={() => toggleKeyVisibility(k.id)} className="p-1 text-muted-foreground hover:text-foreground" title="Toggle visibility">
                  {visibleKeys.has(k.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => toggleKey.mutate({ id: k.id, is_active: !k.is_active })}
                  className={`p-1 rounded ${k.is_active ? "text-success" : "text-muted-foreground"}`}
                  title={k.is_active ? "Aktif — klik untuk nonaktifkan" : "Nonaktif — klik untuk aktifkan"}
                >
                  {k.is_active ? <Power size={18} /> : <PowerOff size={18} />}
                </button>
                <button onClick={() => deleteKey.mutate(k.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {!keysLoading && apiKeys.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada API key. Tambahkan key pertama Anda di atas.</p>
            )}
          </div>

          {/* Test Connection */}
          <button onClick={handleTestConnection} disabled={testing} className="neo-btn bg-card text-sm w-full mb-3">
            {testing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            {testing ? "Menguji..." : "Test Koneksi"}
          </button>

          {testResult && (
            <div className={`flex items-start gap-2 text-sm font-medium p-3 rounded-xl border-2 mb-3 ${testResult.success ? "bg-success/10 border-success/30 text-success" : "bg-destructive/10 border-destructive/30 text-destructive"}`}>
              {testResult.success ? <CheckCircle size={16} className="flex-shrink-0 mt-0.5" /> : <XCircle size={16} className="flex-shrink-0 mt-0.5" />}
              <div>
                {testResult.success
                  ? `Koneksi berhasil! Model: ${testResult.model || "unknown"}`
                  : (testResult.errorCode ? ERROR_MESSAGES[testResult.errorCode] || testResult.error : testResult.error)}
              </div>
            </div>
          )}
        </div>

        {/* Guide Card */}
        <div className="neo-card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-info/10 text-info"><Info size={20} /></div>
            <div>
              <h2 className="font-bold">Cara Mendapatkan API Key Gratis</h2>
              <p className="text-xs text-muted-foreground">6 langkah mudah</p>
            </div>
          </div>
          <div className="space-y-3">
            {GUIDE_STEPS.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">{i + 1}</span>
                <p className="text-sm pt-1">
                  {step.link ? (
                    <a href={step.link} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1">
                      {step.text} <ExternalLink size={12} />
                    </a>
                  ) : step.text}
                </p>
              </div>
            ))}
          </div>
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="neo-btn-primary text-sm w-full mt-4"
          >
            <ExternalLink size={14} /> Buka Google AI Studio
          </a>
        </div>

        {/* Tutorial Visual Card */}
        <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <BookOpen size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Butuh panduan lebih lengkap dengan gambar?</p>
              <p className="text-xs text-muted-foreground mb-2">
                Kami sudah menyiapkan tutorial visual step-by-step agar lebih mudah dipahami.
              </p>
              <a
                href="https://www.canva.com/design/DAHD3pwYN_s/so9hZzTZbGYb4on0uixn9Q/view?utm_content=DAHD3pwYN_s&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h8e5f829d97"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary font-semibold hover:underline inline-flex items-center gap-1"
              >
                Lihat Tutorial Step-by-Step → <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Warning Box */}
        <div className="bg-accent/30 border-2 border-accent rounded-xl p-4 text-sm mb-6">
          <div className="flex gap-2">
            <AlertTriangle size={16} className="text-accent-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Perhatian</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>API Key gratis memiliki batasan penggunaan harian dari Google</li>
                <li>Tips: tambahkan beberapa key untuk meningkatkan kapasitas</li>
                <li>Jangan bagikan API Key Anda kepada siapapun</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-info/10 border-2 border-info/30 rounded-xl p-4 text-sm">
          <div className="flex gap-2">
            <Info size={16} className="text-info flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-info mb-1">Mengapa Perlu API Key?</p>
              <p className="text-muted-foreground text-xs">
                API Key diperlukan agar aplikasi bisa membuat konten kokurikuler (modul, asesmen, rubrik, dll.) secara otomatis menggunakan AI. Dengan key sendiri, Anda mendapat kapasitas penuh tanpa antrian. Jika tidak memiliki key, sistem tetap bisa digunakan dengan kapasitas terbatas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
