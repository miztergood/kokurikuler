import { useState, useRef } from "react";
import { useAllowedCustomers, useAddAllowedCustomer, useAddBulkAllowedCustomers, useDeleteAllowedCustomer } from "@/hooks/useAllowedCustomers";
import { Search, RefreshCw, Upload, Plus, Users, UserCheck, UserX, Trash2, CheckCircle, Clock, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const { data: customers = [], refetch, isLoading } = useAllowedCustomers(search);
  const addOne = useAddAllowedCustomer();
  const addBulk = useAddBulkAllowedCustomers();
  const deleteMut = useDeleteAllowedCustomer();
  const fileRef = useRef<HTMLInputElement>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [addMode, setAddMode] = useState<"single" | "batch">("single");
  const [form, setForm] = useState({ email: "", name: "", phone: "", account_type: "regular" });
  const [batchText, setBatchText] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const claimed = customers.filter(c => c.is_claimed).length;

  const parseBatch = (text: string) => {
    return text.split("\n").map(line => line.trim()).filter(Boolean).map(line => {
      const parts = line.split(/[,\t]/).map(p => p.trim());
      const emailPart = parts.find(p => p.includes("@")) || parts[0];
      const name = parts.length > 1 ? parts.find(p => !p.includes("@")) || emailPart.split("@")[0] : emailPart.split("@")[0];
      const phone = parts.length > 2 ? parts[2] : undefined;
      return { email: emailPart, name: name || "", phone };
    }).filter(p => p.email.includes("@"));
  };

  const batchParsed = parseBatch(batchText);

  const handleAddSingle = async () => {
    if (!form.email || !form.name) { toast.error("Email dan nama wajib diisi"); return; }
    try {
      await addOne.mutateAsync(form);
      toast.success("Pelanggan ditambahkan");
      setShowAdd(false);
      setForm({ email: "", name: "", phone: "", account_type: "regular" });
    } catch (e: any) {
      toast.error(e.message || "Gagal menambahkan");
    }
  };

  const handleAddBatch = async () => {
    if (batchParsed.length === 0) { toast.error("Tidak ada email valid"); return; }
    try {
      await addBulk.mutateAsync(batchParsed);
      toast.success(`${batchParsed.length} pelanggan ditambahkan`);
      setShowAdd(false);
      setBatchText("");
    } catch (e: any) {
      toast.error(e.message || "Gagal menambahkan");
    }
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").slice(1); // skip header
      const parsed = lines.map(line => line.trim()).filter(Boolean).map(line => {
        const parts = line.split(/[,\t]/).map(p => p.trim());
        return { email: parts[0] || "", name: parts[1] || parts[0]?.split("@")[0] || "", phone: parts[2] || undefined };
      }).filter(p => p.email.includes("@"));
      if (parsed.length) {
        addBulk.mutateAsync(parsed).then(() => {
          toast.success(`${parsed.length} pelanggan diimport`);
          refetch();
        }).catch(() => toast.error("Gagal import"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold">Pelanggan Lama</h1>
          <p className="text-sm text-muted-foreground">Kelola daftar pelanggan dari sistem sebelumnya</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => refetch()} className="neo-btn bg-card text-sm"><RefreshCw size={14} /> Sync</button>
          <input type="file" accept=".csv,.txt" ref={fileRef} className="hidden" onChange={handleCSV} />
          <button onClick={() => fileRef.current?.click()} className="neo-btn bg-card text-sm"><Upload size={14} /> Import CSV</button>
          <button onClick={() => { setShowAdd(true); setAddMode("single"); }} className="neo-btn-primary text-sm"><Plus size={14} /> Tambah</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="neo-card text-center">
          <Users size={20} className="mx-auto text-primary mb-1" />
          <p className="text-2xl font-extrabold">{customers.length}</p>
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Total</p>
        </div>
        <div className="neo-card text-center">
          <UserCheck size={20} className="mx-auto text-success mb-1" />
          <p className="text-2xl font-extrabold">{claimed}</p>
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Sudah Login</p>
        </div>
        <div className="neo-card text-center">
          <UserX size={20} className="mx-auto text-accent-foreground mb-1" />
          <p className="text-2xl font-extrabold">{customers.length - claimed}</p>
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Belum Login</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari berdasarkan email, nama, telepon..." className="neo-input pl-10" />
      </div>

      {/* CSV hint */}
      <div className="bg-secondary/50 border-2 border-dashed border-foreground/20 rounded-xl p-3 mb-4 text-xs text-muted-foreground">
        <strong>Format CSV:</strong> email, nama, telepon (satu baris per pelanggan)
      </div>

      {/* Table */}
      <div className="neo-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-foreground bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase">Nama</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase hidden sm:table-cell">Telepon</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase hidden sm:table-cell">Tipe</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase hidden md:table-cell">Ditambahkan</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-foreground/10">
                    <td colSpan={7} className="px-4 py-4"><div className="h-4 bg-muted animate-pulse rounded-lg" /></td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground font-bold">Belum ada pelanggan</td></tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id} className="border-b border-foreground/10 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{c.phone || "—"}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${c.account_type === "trial" ? "bg-info/10 text-info" : "bg-primary/10 text-primary"}`}>
                        {c.account_type === "trial" ? "Trial" : "Regular"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.is_claimed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-success"><CheckCircle size={14} /> Login</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground"><Clock size={14} /> Belum</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setDeleteTarget(c)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Pelanggan</DialogTitle>
          </DialogHeader>
          {/* Tab */}
          <div className="flex border-2 border-foreground rounded-xl overflow-hidden mb-4">
            <button onClick={() => setAddMode("single")} className={`flex-1 py-2 text-sm font-bold ${addMode === "single" ? "bg-foreground text-background" : "bg-card"}`}>Satu</button>
            <button onClick={() => setAddMode("batch")} className={`flex-1 py-2 text-sm font-bold ${addMode === "batch" ? "bg-foreground text-background" : "bg-card"}`}>Batch</button>
          </div>

          {addMode === "single" ? (
            <div className="space-y-3">
              <div><label className="text-xs font-bold uppercase mb-1 block">Email *</label><input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="neo-input" /></div>
              <div><label className="text-xs font-bold uppercase mb-1 block">Nama *</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="neo-input" /></div>
              <div><label className="text-xs font-bold uppercase mb-1 block">Telepon</label><input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="neo-input" /></div>
              <div>
                <label className="text-xs font-bold uppercase mb-1 block">Tipe Akun</label>
                <select value={form.account_type} onChange={e => setForm(p => ({ ...p, account_type: e.target.value }))} className="neo-input">
                  <option value="regular">Regular</option>
                  <option value="trial">Trial</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={batchText}
                onChange={e => setBatchText(e.target.value)}
                rows={6}
                placeholder={"email@contoh.com, Nama, 08xx\nemail2@contoh.com, Nama2"}
                className="neo-input resize-none"
              />
              {batchParsed.length > 0 && (
                <p className="text-xs font-bold text-success">{batchParsed.length} email valid terdeteksi</p>
              )}
            </div>
          )}

          <DialogFooter>
            <button onClick={() => setShowAdd(false)} className="neo-btn bg-card">Batal</button>
            <button onClick={addMode === "single" ? handleAddSingle : handleAddBatch} className="neo-btn-primary">
              {addMode === "single" ? "Tambah" : `Tambah ${batchParsed.length} Pelanggan`}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pelanggan?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email}) akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteMut.mutate(deleteTarget.id); setDeleteTarget(null); }} className="bg-destructive text-destructive-foreground">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
