import { useState, useCallback, useEffect } from "react";
import { Activity, Info, LayoutTemplate, Settings, User, LogOut, AlertTriangle, Loader2, RotateCcw, Calendar } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FormData, GeneratedContent, initialFormState, IDENTIFIKASI_FIELDS } from "@/lib/constants";
import { generateDocument } from "@/lib/generator";
import { buildModulPrompt } from "@/lib/aiPrompt";
import { supabase } from "@/integrations/supabase/client";
import { InformasiUmum } from "@/components/form/InformasiUmum";
import { DimensiLulusan } from "@/components/form/DimensiLulusan";
import { SaranaAsesmen } from "@/components/form/SaranaAsesmen";
import { Otorisasi } from "@/components/form/Otorisasi";
import { DocumentPreview } from "@/components/DocumentPreview";
import { ProfileManager } from "@/components/ProfileManager";
import { HeaderHistoryDropdown } from "@/components/HeaderHistoryDropdown";
import { SaveHistoryModal } from "@/components/SaveHistoryModal";
import { useAuth } from "@/contexts/AuthContext";
import { useMigrateLocalProfiles } from "@/hooks/useTeacherProfiles";
import { useDeleteContentHistory, type ContentHistoryItem } from "@/hooks/useContentHistory";
import { toast } from "sonner";

const AppPage = () => {
  const [formData, setFormData] = useState<FormData>({ ...initialFormState });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Pre-fill form from Big Plan redirect
  useEffect(() => {
    if (searchParams.get("fromBigPlan") === "true") {
      try {
        const prefillJson = searchParams.get("prefill");
        if (prefillJson) {
          const prefill = JSON.parse(decodeURIComponent(prefillJson));
          setFormData(prev => ({ ...prev, ...prefill }));
        }
      } catch (e) {
        console.error("Failed to parse prefill data:", e);
      }
      // Clear query params after reading
      setSearchParams({}, { replace: true });
    }
  }, []);

  // Profile state
  const [selectedProfile, setSelectedProfile] = useState("");
  const [showMigrationBanner, setShowMigrationBanner] = useState(false);
  const migrateMutation = useMigrateLocalProfiles();

  // History state
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [showSaveHistoryModal, setShowSaveHistoryModal] = useState(false);
  const deleteHistoryMutation = useDeleteContentHistory();

  // Check for local profiles to migrate
  useEffect(() => {
    const raw = localStorage.getItem("perangkat_ajar_profiles");
    if (raw) setShowMigrationBanner(true);
  }, []);

  const handleChange = useCallback((field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCheckboxGroup = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => {
      const arr = (prev[field] as string[]) || [];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
  }, []);

  const handleDimensionChange = useCallback((dim: string, indicator: string) => {
    setFormData(prev => {
      const dimensi = { ...prev.dimensi };
      if (!dimensi[dim]) {
        if (Object.keys(dimensi).length >= 3) return prev;
        dimensi[dim] = [indicator];
      } else {
        const inds = dimensi[dim];
        if (inds.includes(indicator)) {
          const newInds = inds.filter(i => i !== indicator);
          if (newInds.length === 0) delete dimensi[dim];
          else dimensi[dim] = newInds;
        } else {
          dimensi[dim] = [...inds, indicator];
        }
      }
      return { ...prev, dimensi };
    });
  }, []);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!formData.judul || !formData.tema) {
      alert("Mohon lengkapi Judul dan Tema terlebih dahulu pada bagian Informasi Umum.");
      return;
    }

    setIsGenerating(true);
    try {
      const { prompt, systemPrompt } = buildModulPrompt(formData);
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { prompt, systemPrompt, type: "modul" },
      });

      if (error) throw error;

      if (data?.success && data?.json) {
        const json = data.json as GeneratedContent;
        // Validate required fields
        if (json.tujuan && json.langkahDetail && json.instruksiLKPD && json.soalUraian) {
          setGeneratedContent(json);
          toast.success("Modul berhasil di-generate dengan AI!");
          return;
        }
      }

      if (data?.success && data?.text) {
        // Try parsing text manually
        try {
          let cleaned = data.text.trim();
          if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
          if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
          if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
          const parsed = JSON.parse(cleaned.trim()) as GeneratedContent;
          if (parsed.tujuan && parsed.langkahDetail) {
            setGeneratedContent(parsed);
            toast.success("Modul berhasil di-generate dengan AI!");
            return;
          }
        } catch { /* fall through to fallback */ }
      }

      // If we get here, AI response wasn't parseable — use fallback
      throw new Error(data?.error || "Respons AI tidak valid");
    } catch (err) {
      console.error("AI generation failed, using fallback:", err);
      setGeneratedContent(generateDocument(formData));
      toast.info("Menggunakan template standar (AI tidak tersedia)");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...initialFormState });
    setGeneratedContent(null);
    setSelectedHistoryId(null);
  };

  // Profile handlers
  const handleLoadProfile = (data: Record<string, string | string[]>) => {
    setFormData(prev => {
      const updates: Partial<FormData> = {};
      for (const key of IDENTIFIKASI_FIELDS) {
        if (data[key] !== undefined) {
          (updates as Record<string, unknown>)[key] = data[key];
        }
      }
      return { ...prev, ...updates };
    });
  };

  const handleMigrate = async () => {
    try {
      await migrateMutation.mutateAsync();
      setShowMigrationBanner(false);
      toast.success("Profil lokal berhasil dimigrasikan ke cloud!");
    } catch {
      toast.error("Gagal migrasi profil");
    }
  };

  // History handlers
  const handleLoadHistory = (item: ContentHistoryItem) => {
    setFormData(item.form_data);
    setGeneratedContent(item.modul_data);
    setSelectedHistoryId(item.id);
    toast.success("Riwayat konten dimuat!");
  };

  const handleDeleteHistory = async () => {
    if (!selectedHistoryId || !window.confirm("Hapus riwayat konten ini?")) return;
    try {
      await deleteHistoryMutation.mutateAsync(selectedHistoryId);
      setSelectedHistoryId(null);
      toast.success("Riwayat berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus riwayat");
    }
  };

  const openSaveHistoryModal = () => {
    setShowSaveHistoryModal(true);
  };

  const hasContent = !!generatedContent;

  const defaultHistoryName = (() => {
    const date = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    if (formData.judul) return `${formData.judul} (${date})`;
    if (formData.tema) return `${formData.tema} (${date})`;
    return `Riwayat (${date})`;
  })();

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "";

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="bg-card border-b-2 border-foreground px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between flex-shrink-0" style={{ boxShadow: "0 2px 0 0 hsl(var(--foreground))" }}>
        <div className="flex items-center gap-2 sm:gap-3">
          <LayoutTemplate size={22} className="text-primary" />
          <h1 className="font-display font-bold text-lg hidden sm:block">Aplikasi Perencanaan Ko Kurikuler</h1>
          <span className="neo-badge bg-accent text-accent-foreground ml-2 hidden sm:inline-block">Kurikulum Merdeka</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => navigate("/app/big-plan")}
            className="neo-btn py-1 px-2 text-xs bg-accent text-accent-foreground flex items-center gap-1"
            title="Program Tahunan"
          >
            <Calendar size={14} />
            <span className="hidden sm:inline">Program Tahunan</span>
          </button>
          <HeaderHistoryDropdown
            selectedHistoryId={selectedHistoryId}
            hasContent={hasContent}
            onLoad={handleLoadHistory}
            onSaveNew={openSaveHistoryModal}
            onDelete={handleDeleteHistory}
            onDeselect={() => setSelectedHistoryId(null)}
          />
          <button className="md:hidden neo-btn py-1 px-2 text-xs bg-card" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "Preview" : "Form"}
          </button>
          {isAdmin && (
            <button onClick={() => navigate("/admin")} className="hidden sm:block p-2 hover:bg-muted rounded-lg transition-colors text-xs font-bold border-2 border-foreground" title="Admin">
              Admin
            </button>
          )}
          <button className="hidden sm:block p-2 hover:bg-muted rounded-lg transition-colors" title="Pengaturan" onClick={() => navigate("/settings")}><Settings size={20} /></button>
          <div className="flex items-center gap-1 sm:gap-1.5 ml-0.5 sm:ml-1 pl-1 sm:pl-2 border-l-2 border-foreground/20">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <User size={16} className="text-primary-foreground" />
            </div>
            {displayName && <span className="text-xs font-bold hidden sm:block max-w-[120px] truncate">{displayName}</span>}
            <button onClick={signOut} className="p-1 hover:bg-muted rounded-lg transition-colors" title="Keluar">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <aside className={`${sidebarOpen ? "flex" : "hidden"} md:flex flex-col w-full md:w-[420px] lg:w-[460px] h-full border-r-2 border-foreground bg-card overflow-y-scroll flex-shrink-0`}>
          <div className="p-4">
            {showMigrationBanner && (
              <div className="neo-card mb-4 bg-accent/30 border-accent flex items-center gap-3 p-3">
                <AlertTriangle size={18} className="text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold">Profil lokal ditemukan</p>
                  <p className="text-[10px] text-muted-foreground">Migrasikan ke cloud agar tersimpan aman.</p>
                </div>
                <button onClick={handleMigrate} disabled={migrateMutation.isPending} className="neo-btn py-1 px-2 text-[10px] bg-primary text-primary-foreground">
                  {migrateMutation.isPending ? "..." : "Migrasi"}
                </button>
              </div>
            )}

            <ProfileManager
              formData={formData}
              selectedProfile={selectedProfile}
              onSelectProfile={setSelectedProfile}
              onLoadProfile={handleLoadProfile}
            />

            <div className="neo-card mb-4 bg-secondary border-foreground/60 flex gap-3">
              <Info size={24} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Tips Pengisian Form</p>
                <p className="text-xs text-muted-foreground">Isi field dengan label <span className="neo-badge bg-primary text-primary-foreground text-[9px] py-0">Wajib</span>. Modul akan di-generate otomatis.</p>
              </div>
            </div>
            <InformasiUmum formData={formData} onChange={handleChange} onCheckboxGroup={handleCheckboxGroup} />
            <DimensiLulusan formData={formData} onDimensionChange={handleDimensionChange} />
            <SaranaAsesmen formData={formData} onChange={handleChange} onCheckboxGroup={handleCheckboxGroup} />
            <Otorisasi formData={formData} onChange={handleChange} />
            <button onClick={handleGenerate} disabled={isGenerating} className="neo-btn-primary w-full mb-3 disabled:opacity-70">
              {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Activity size={24} />}
              {isGenerating ? "GENERATING..." : "GENERATE MODUL"}
            </button>
            <button onClick={handleReset} className="neo-btn w-full mb-3 bg-card">
              <RotateCcw size={18} />
              BUAT LAGI
            </button>
          </div>
        </aside>

        <div className={`${!sidebarOpen ? "flex" : "hidden"} md:flex flex-col flex-1 min-h-0 overflow-hidden`}>
          <DocumentPreview formData={formData} content={generatedContent} isGenerating={isGenerating} onReset={handleReset} />
        </div>
      </div>

      <SaveHistoryModal
        open={showSaveHistoryModal}
        onClose={() => setShowSaveHistoryModal(false)}
        formData={formData}
        generatedContent={generatedContent}
        defaultName={defaultHistoryName}
      />
    </div>
  );
};

export default AppPage;
