import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Users, UserCheck, Settings, Home, LogOut, Menu, X, LayoutTemplate } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Pengguna", path: "/admin/users", icon: Users },
  { label: "Pelanggan Lama", path: "/admin/customers", icon: UserCheck },
  { label: "Pengaturan", path: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b-2 border-foreground">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="text-primary flex-shrink-0" size={24} />
          {!collapsed && (
            <div>
              <h2 className="font-display font-extrabold text-sm leading-tight">Admin Panel</h2>
              <p className="text-[10px] text-muted-foreground font-medium">Kokurikuler.Online</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
              isActive(item.path)
                ? "bg-foreground text-background"
                : "hover:bg-muted"
            }`}
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t-2 border-foreground space-y-2">
        <button
          onClick={() => navigate("/app")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
        >
          <Home size={18} />
          {!collapsed && <span>Ke Aplikasi</span>}
        </button>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={18} />
          {!collapsed && <span>Keluar</span>}
        </button>
        {!collapsed && user?.email && (
          <p className="text-[10px] text-muted-foreground truncate px-3">{user.email}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-card border-r-2 border-foreground transition-all duration-300 flex-shrink-0 ${collapsed ? "w-20" : "w-64"}`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-center text-xs font-bold text-muted-foreground hover:text-foreground border-t-2 border-foreground"
        >
          {collapsed ? "»" : "«"}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r-2 border-foreground z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-card border-b-2 border-foreground">
          <button onClick={() => setMobileOpen(true)} className="p-1">
            <Menu size={20} />
          </button>
          <h1 className="font-display font-bold text-sm">Admin Panel</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
