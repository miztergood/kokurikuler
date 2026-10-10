import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "admin" | "user";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (!error && Array.isArray(data) && data.length > 0) {
        const isAdmin = data.some((r: any) => r.role === "admin");
        setRole(isAdmin ? "admin" : "user");
      } else {
        setRole("user");
      }
    } catch {
      setRole("user");
    }
  }, []);

  const refreshRole = useCallback(async () => {
    if (user) await fetchRole(user.id);
  }, [user, fetchRole]);

  useEffect(() => {
    // Setup listener BEFORE getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Use setTimeout to avoid Supabase deadlock
        setTimeout(() => fetchRole(session.user.id), 0);
      } else {
        setRole(null);
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchRole]);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split("@")[0] },
        emailRedirectTo: window.location.origin,
      },
    });

    // If user already exists (pre-migrated account claiming password for first time)
    if (
      res.error &&
      (res.error.message?.toLowerCase().includes("already exists") ||
        (res.error as any).code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" ||
        (res.error as any).status === 422)
    ) {
      const claimRes = await supabase.functions.invoke("claim-account", {
        body: { email, password, displayName },
      });
      if (claimRes.error) {
        return { error: claimRes.error as Error };
      }
      return { error: null };
    }

    return { error: res.error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, isLoading, isAdmin: role === "admin", signUp, signIn, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
