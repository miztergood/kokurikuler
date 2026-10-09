import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  LayoutTemplate, Settings, User, LogOut, Loader2, Save, FileDown,
  FileSpreadsheet, ArrowLeft, Sparkles, RotateCcw, ChevronDown, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SchoolContextForm } from "@/components/bigplan/SchoolContextForm";
import { BigPlanTable } from "@/components/bigplan/BigPlanTable";
import { useBigPlans, useBigPlan, useSaveBigPlan, useDeleteBigPlan } from "@/hooks/useBigPlans";
import { buildBigPlanPrompt } from "@/lib/bigPlanPrompt";
import { exportBigPlanDocx, exportBigPlanXlsx } from "@/lib/exportBigPlan";
import { toast } from "sonner";
import type { SchoolContext, BigPlanTheme, BigPlan } from "@/lib/bigPlanConstants";
import { initialSchoolContext } from "@/lib/bigPlanConstants";
import { mapBigPlanToFormData } from "@/lib/bigPlanMapping";

const BigPlanPage = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [planName, setPlanName] = useState("");
  const [context, setContext] = useState<SchoolContext>({ ...initialSchoolContext });
  const [themes, setThemes] = useState<BigPlanTheme[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(editId);
  const [showPlanList, setShowPlanList] = useState(false);

  const { data: plans = [] } = useBigPlans();
  const { data: loadedPlan } = useBigPlan(editId);
  const saveMutation = useSaveBigPlan();
  const deleteMutation = useDeleteBigPlan();

  // Load existing plan
  useEffect(() => {
    if (loadedPlan) {
      setPlanName(loadedPlan.name);
      setContext(loadedPlan.school_context);
      setThemes(loadedPlan.themes);
      setCurrentPlanId(loadedPlan.id);
    }
  }, [loadedPlan]);

  const handleGenerate = async () => {
    if (!context.jenjang || !context.kelas || !context.totalJP) {
      toast.error("Lengkapi Jenjang, Kelas, dan Total JP terlebih dahulu");
      return;
    }

    setIsGenerating(true);
    try {
      const { prompt, systemPrompt } = buildBigPlanPrompt(context);
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { prompt, systemPrompt, type: "big-plan" },
      });

      if (error) throw error;

      // Try parsed JSON first
      let parsed: BigPlanTheme[] | null = null;
      if (data?.success && data?.json) {
        if (Array.isArray(data.json)) parsed = data.json;
      }
      if (!parsed && data?.success && data?.text) {
        try {
          let cleaned = data.text.trim();
          if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
          if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
          if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
          const result = JSON.parse(cleaned.trim());
          if (Array.isArray(result)) parsed = result;
        } catch { /* ignore */ }
      }

      if (parsed && parsed.length > 0) {
        setThemes(parsed.map((t, i) => ({ ...t, no: i + 1 })));
        toast.success(`${parsed.length} tema berhasil di-generate!`);
      } else {
        throw new Error("Respons AI tidak valid");
      }
    } catch (err) {
      console.error("Big Plan generation failed:", err);
      toast.error("Gagal generate. Silakan coba lagi atau tambahkan tema manual.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!planName.trim()) {
      toast.error("Nama program wajib diisi");
      return;
    }
    try {
      const id = await saveMutation.mutateAsync({
        id: currentPlanId || undefined,
        name: planName.trim(),
        school_context: context,
        themes,
      });
      setCurrentPlanId(id);
      toast.success("Program berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan program");
    }
  };

  const handleLoadPlan = (plan: BigPlan) => {
    setPlanName(plan.name);
    setContext(plan.school_context);
    setThemes(plan.themes);
    setCurrentPlanId(plan.id);
    setShowPlanList(false);
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm("Hapus program ini?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      if (currentPlanId === id) {
        setPlanName("");
        setContext({ ...initialSchoolContext });
        setThemes([]);
        setCurrentPlanId(null);
      }
      toast.success("Program berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus program");
    }
  };

  const handleNewPlan = () => {
    setPlanName("");
    setContext({ ...initialSchoolContext });
    setThemes([]);
    setCurrentPlanId(null);
    setShowPlanList(false);
  };

  const handleCreateDetail = (theme: BigPlanTheme) => {
    // Map Big Plan theme + context to full form data (including checkboxes)
    const prefill = mapBigPlanToFormData(theme, context);
    const params = new URLSearchParams({
      fromBigPlan: "true",
      prefill: JSON.stringify(prefill),
    });
    navigate(`/app?${params.toString()}`);
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b-2 border-foreground px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-20" style={{ boxShadow: "0 2px 0 0 hsl(var(--foreground))" }}>
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => navigate("/app")} className="p-1 hover:bg-muted rounded-lg transition-colors" title="Kembali">
            <ArrowLeft size={20} />
          </button>
          <LayoutTemplate size={22} className="text-primary" />
          <h1 className="font-display font-bold text-lg hidden sm:block">Program Tahunan Kokurikuler</h1>
          <span className="neo-badge bg-accent text-accent-foreground ml-2 hidden sm:inline-block">Big Plan</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Plan list dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPlanList(!showPlanList)}
              className="neo-btn py-1 px-2 text-xs bg-card flex items-center gap-1"
            >
              <span className="hidden sm:inline">Program Tersimpan</span>
              <ChevronDown size={14} />
            </button>
            {showPlanList && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-card border-2 border-foreground rounded-lg shadow-[var(--shadow-brutal)] z-30 overflow-hidden">
                <button
                  onClick={handleNewPlan}
                  className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-muted transition-colors border-b border-foreground/20"
                >
                  + Buat Program Baru
                </button>
                {plans.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-muted-foreground text-center">Belum ada program tersimpan</div>
                ) : (
                  plans.map((p) => (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between px-3 py-2 hover:bg-muted transition-colors ${currentPlanId === p.id ? "bg-primary/10" : ""}`}
                    >
                      <button
                        onClick={() => handleLoadPlan(p)}
                        className="flex-1 text-left text-xs font-semibold truncate"
                      >
                        {p.name}
                      </button>
                      <button onClick={() => handleDeletePlan(p.id)} className="p-1 hover:bg-destructive/10 rounded">
                        <Trash2 size={12} className="text-destructive" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <button className="md:hidden neo-btn py-1 px-2 text-xs bg-card" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "Tabel" : "Form"}
          </button>
          {isAdmin && (
            <button onClick={() => navigate("/admin")} className="hidden sm:block p-2 hover:bg-muted rounded-lg transition-colors text-xs font-bold border-2 border-foreground" title="Admin">
              Admin
            </button>
          )}
          <button className="hidden sm:block p-2 hover:bg-muted rounded-lg transition-colors" title="Pengaturan" onClick={() => navigate("/settings")}>
            <Settings size={20} />
          </button>
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Form */}
        <aside className={`${sidebarOpen ? "flex" : "hidden"} md:flex flex-col w-full md:w-[380px] lg:w-[420px] border-r-2 border-foreground bg-card overflow-y-auto flex-shrink-0`}>
          <div className="p-4 space-y-4">
            {/* Plan Name */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-1">Nama Program</label>
              <Input
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Contoh: Program Kelas V 2025/2026"
                className="neo-input font-bold"
              />
            </div>

            <SchoolContextForm context={context} onChange={setContext} />

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full neo-btn-primary"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {isGenerating ? "GENERATING..." : "GENERATE DENGAN AI"}
              </Button>

              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                variant="outline"
                className="w-full border-2 border-foreground"
              >
                <Save size={18} />
                {saveMutation.isPending ? "MENYIMPAN..." : "SIMPAN PROGRAM"}
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={() => exportBigPlanDocx(context, themes, planName)}
                  disabled={themes.length === 0}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-2 border-foreground"
                >
                  <FileDown size={14} /> .DOCX
                </Button>
                <Button
                  onClick={() => exportBigPlanXlsx(context, themes, planName)}
                  disabled={themes.length === 0}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-2 border-foreground"
                >
                  <FileSpreadsheet size={14} /> .XLSX
                </Button>
              </div>

              <Button
                onClick={handleNewPlan}
                variant="ghost"
                className="w-full"
              >
                <RotateCcw size={16} /> BUAT BARU
              </Button>
            </div>
          </div>
        </aside>

        {/* Main - Table */}
        <div className={`${!sidebarOpen ? "flex" : "hidden"} md:flex flex-col flex-1 min-h-0 overflow-auto`}>
          <div className="p-4 sm:p-6">
            {/* Title */}
            <div className="mb-6">
              <h2 className="text-xl font-extrabold">
                {planName || "Program Tahunan Kokurikuler"}
              </h2>
              {context.sekolah && (
                <p className="text-sm text-muted-foreground">
                  {context.sekolah} | {context.jenjang} Kelas {context.kelas} | Fase {context.fase} | TA {context.tahunAjaran}
                </p>
              )}
            </div>

            <BigPlanTable
              themes={themes}
              onChange={setThemes}
              totalJP={context.totalJP}
              onCreateDetail={handleCreateDetail}
            />

            {themes.length > 0 && (
              <div className="mt-6 neo-card bg-secondary/50 p-4">
                <p className="text-xs font-bold text-muted-foreground mb-1">💡 Tips</p>
                <p className="text-xs text-muted-foreground">
                  Klik ikon <FileDown size={12} className="inline" /> di setiap baris untuk membuat Perencanaan Detail per tema.
                  Klik langsung pada cell tabel untuk mengedit konten.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BigPlanPage;
