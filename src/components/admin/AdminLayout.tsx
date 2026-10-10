import { ReactNode, useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Sparkles,
  Home,
  UserCheck,
} from 'lucide-react';

interface AdminLayoutProps {
  children?: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Pengguna', path: '/admin/users' },
  { icon: UserCheck, label: 'Pelanggan Lama', path: '/admin/customers' },
  { icon: Settings, label: 'Pengaturan', path: '/admin/settings' },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b-2 border-foreground z-50 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-secondary rounded-lg border-2 border-foreground shadow-brutal-sm"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg border-2 border-foreground flex items-center justify-center shadow-brutal-sm">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-extrabold text-sm block leading-tight">Admin Panel</span>
              <span className="text-[10px] text-muted-foreground font-medium block">Kokurikuler.Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-card border-r-2 border-foreground z-50 transition-all duration-300 flex flex-col justify-between ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b-2 border-foreground">
            {sidebarOpen ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 bg-primary rounded-xl border-2 border-foreground flex items-center justify-center shadow-brutal-sm flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-sm truncate">Admin Panel</span>
                  <span className="text-xs text-muted-foreground truncate font-medium">Kokurikuler.Online</span>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 mx-auto bg-primary rounded-xl border-2 border-foreground flex items-center justify-center shadow-brutal-sm">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-1.5 hover:bg-secondary rounded-lg transition-colors border border-foreground/20"
              title={sidebarOpen ? 'Ciutkan Sidebar' : 'Buka Sidebar'}
            >
              <ChevronLeft
                className={`w-4 h-4 transition-transform duration-200 ${!sidebarOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                    isActive
                      ? 'bg-foreground text-background border-foreground shadow-brutal-sm'
                      : 'border-transparent text-foreground hover:bg-secondary hover:border-foreground/20'
                  }`}
                  title={item.label}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t-2 border-foreground/20 space-y-2">
          <Link
            to="/app"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 border-transparent hover:bg-secondary hover:border-foreground/20 font-bold text-sm transition-all"
            title="Ke Aplikasi"
          >
            <Home className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
            {sidebarOpen && <span>Ke Aplikasi</span>}
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 border-transparent hover:bg-destructive/10 hover:border-destructive/30 text-destructive font-bold text-sm transition-all text-left"
            title="Keluar"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Keluar</span>}
          </button>
          {sidebarOpen && user && (
            <div className="mt-2 p-2.5 bg-secondary/60 rounded-xl border border-foreground/15">
              <p className="text-xs font-bold truncate text-foreground">{user.email}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Administrator</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 min-w-0 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        } pt-16 lg:pt-0`}
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
