import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAdmin, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="neo-card p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-bold">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (role !== null && !isAdmin) return <Navigate to="/" replace />;
  if (role === null && !isLoading) return <Navigate to="/" replace />;

  return <>{children}</>;
}
