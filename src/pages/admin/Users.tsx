import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search, RefreshCw, Shield, User, MoreVertical, Trash2, Key, UserCog, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface UserRow {
  user_id: string;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("user_id, email, display_name, created_at"),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    const roleMap: Record<string, string> = {};
    roles?.forEach(r => { roleMap[r.user_id] = r.role; });

    setUsers(
      (profiles || []).map(p => ({
        ...p,
        role: roleMap[p.user_id] || "user",
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (u: UserRow) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    const { error } = await supabase.from("user_roles").update({ role: newRole }).eq("user_id", u.user_id);
    if (error) toast.error("Gagal mengubah role");
    else { toast.success(`Role diubah menjadi ${newRole}`); fetchUsers(); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from("user_roles").delete().eq("user_id", deleteTarget.user_id);
    await supabase.from("profiles").delete().eq("user_id", deleteTarget.user_id);
    toast.success("Pengguna dihapus");
    setDeleteTarget(null);
    fetchUsers();
  };

  const handleResetPassword = async () => {
    if (!resetTarget || newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    const { error } = await supabase.functions.invoke("admin-reset-password", {
      body: { userId: resetTarget.user_id, newPassword },
    });
    if (error) toast.error("Gagal reset password");
    else toast.success("Password berhasil direset");
    setResetTarget(null);
    setNewPassword("");
  };

  const filtered = users.filter(u =>
    u.display_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === "admin").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold">Pengguna</h1>
          <p className="text-sm text-muted-foreground">Kelola semua pengguna terdaftar</p>
        </div>
        <button onClick={fetchUsers} className="neo-btn bg-card text-sm">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari pengguna berdasarkan nama atau email..."
          className="neo-input pl-10"
        />
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full border-2 border-foreground text-xs font-bold">Total: {users.length}</span>
        <span className="inline-flex items-center px-3 py-1 rounded-full border-2 border-primary/50 bg-primary/10 text-xs font-bold">Admin: {adminCount}</span>
        <span className="inline-flex items-center px-3 py-1 rounded-full border-2 border-foreground/30 bg-secondary text-xs font-bold">User: {users.length - adminCount}</span>
      </div>

      {/* Table */}
      <div className="neo-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-foreground bg-muted/50">
                <th className="text-left px-4 py-3 font-bold uppercase text-xs">Pengguna</th>
                <th className="text-left px-4 py-3 font-bold uppercase text-xs hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-bold uppercase text-xs">Role</th>
                <th className="text-left px-4 py-3 font-bold uppercase text-xs hidden md:table-cell">Bergabung</th>
                <th className="px-4 py-3 font-bold uppercase text-xs text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-foreground/10">
                    <td colSpan={5} className="px-4 py-4"><div className="h-4 bg-muted animate-pulse rounded-lg" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <User size={40} className="mx-auto text-muted-foreground mb-2" />
                    <p className="font-bold text-muted-foreground">Belum ada pengguna terdaftar</p>
                  </td>
                </tr>
              ) : (
                filtered.map(u => (
                  <tr key={u.user_id} className="border-b border-foreground/10 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center font-bold text-sm text-primary">
                          {u.display_name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span className="font-medium">{u.display_name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"}`}>
                        {u.role === "admin" ? <Shield size={12} /> : <User size={12} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 hover:bg-muted rounded-lg">
                          <MoreVertical size={16} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleRole(u)}>
                            <UserCog size={14} className="mr-2" />
                            Jadikan {u.role === "admin" ? "User" : "Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setResetTarget(u); setNewPassword(""); setShowPw(false); }}>
                            <Key size={14} className="mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          {u.user_id !== currentUser?.id && (
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(u)}>
                              <Trash2 size={14} className="mr-2" />
                              Hapus Pengguna
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Pengguna <strong>{deleteTarget?.display_name}</strong> ({deleteTarget?.email}) akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset password dialog */}
      <Dialog open={!!resetTarget} onOpenChange={() => setResetTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password — {resetTarget?.display_name}</DialogTitle>
            <DialogDescription>Masukkan password baru untuk pengguna ini.</DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-xs font-bold uppercase mb-1 block">Password Baru</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                minLength={6}
                className="neo-input pr-10"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setResetTarget(null)} className="neo-btn bg-card">Batal</button>
            <button onClick={handleResetPassword} className="neo-btn-primary">Reset</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
