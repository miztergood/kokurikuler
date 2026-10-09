import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/admin/StatCard";
import { Users, UserPlus, FileText, Sparkles, TrendingUp, Activity, Settings, UserCheck } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, newUsers: 0, totalProfiles: 0, totalContent: 0, contentWeek: 0 });

  useEffect(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
      supabase.from("generation_logs").select("id", { count: "exact", head: true }),
      supabase.from("generation_logs").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    ]).then(([users, newUsers, content, contentWeek]) => {
      setStats({
        totalUsers: users.count || 0,
        newUsers: newUsers.count || 0,
        totalProfiles: users.count || 0,
        totalContent: content.count || 0,
        contentWeek: contentWeek.count || 0,
      });
    });
  }, []);

  const quickActions = [
    { label: "Kelola Pengguna", desc: "Lihat dan kelola semua pengguna", icon: Users, path: "/admin/users" },
    { label: "Pelanggan Lama", desc: "Import dan kelola pelanggan lama", icon: UserCheck, path: "/admin/customers" },
    { label: "Pengaturan", desc: "API key dan konfigurasi sistem", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Selamat datang di panel administrasi Kokurikuler Online</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Pengguna" value={stats.totalUsers} icon={Users} colorClass="bg-primary/10 text-primary" />
        <StatCard label="Pengguna Baru" value={stats.newUsers} icon={UserPlus} colorClass="bg-success/10 text-success" />
        <StatCard label="Total Profil" value={stats.totalProfiles} icon={FileText} colorClass="bg-info/10 text-info" />
        <StatCard label="Total Konten" value={stats.totalContent} icon={Sparkles} colorClass="bg-primary/10 text-primary" />
        <StatCard label="Konten Minggu Ini" value={stats.contentWeek} icon={TrendingUp} colorClass="bg-success/10 text-success" />
        <StatCard label="Status Sistem" value="Aktif" icon={Activity} colorClass="bg-success/10 text-success" />
      </div>

      <div className="neo-card">
        <h2 className="font-display font-bold text-lg mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map(a => (
            <button
              key={a.path}
              onClick={() => navigate(a.path)}
              className="neo-card-hover text-left flex items-start gap-3"
            >
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <a.icon size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
