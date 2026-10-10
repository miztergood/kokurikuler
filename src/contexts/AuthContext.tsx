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
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("kokurikuler_auth_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [session, setSession] = useState<Session | null>(() => {
    try {
      const saved = localStorage.getItem("kokurikuler_auth_session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState<AppRole | null>(() => {
    try {
      const saved = localStorage.getItem("kokurikuler_auth_role");
      return (saved as AppRole) || null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(!user);

  const fetchRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (!error && Array.isArray(data) && data.length > 0) {
        const isAdmin = data.some((r: any) => r.role === "admin");
        const userRole = isAdmin ? "admin" : "user";
        setRole(userRole);
        localStorage.setItem("kokurikuler_auth_role", userRole);
      } else {
        setRole("user");
        localStorage.setItem("kokurikuler_auth_role", "user");
      }
    } catch {
      setRole("user");
      localStorage.setItem("kokurikuler_auth_role", "user");
    }
  }, []);

  const refreshRole = useCallback(async () => {
    if (user) await fetchRole(user.id);
  }, [user, fetchRole]);

  useEffect(() => {
    // 1. Setup onAuthStateChange listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        localStorage.setItem("kokurikuler_auth_user", JSON.stringify(session.user));
        localStorage.setItem("kokurikuler_auth_session", JSON.stringify(session));
        fetchRole(session.user.id);
      }
      setIsLoading(false);
    });

    // 2. Fetch session from server/adapter
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        localStorage.setItem("kokurikuler_auth_user", JSON.stringify(session.user));
        localStorage.setItem("kokurikuler_auth_session", JSON.stringify(session));
        fetchRole(session.user.id);
      } else {
        // Fallback: if we had a saved user in storage
        const savedUserStr = localStorage.getItem("kokurikuler_auth_user");
        if (savedUserStr) {
          try {
            const savedUser = JSON.parse(savedUserStr);
            setUser(savedUser);
            fetchRole(savedUser.id);
          } catch {}
        }
      }
      setIsLoading(false);
    }).catch(() => {
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
    try {
      // 1. Attempt standard signInWithPassword
      const res = await supabase.auth.signInWithPassword({ email, password });

      let loggedInUser: User | null = (res.data?.user || res.data?.session?.user) ?? null;
      let loggedInSession: Session | null = res.data?.session ?? null;

      // 2. If standard signIn failed (e.g. third-party cookie blocked in incognito causing session fetch fail)
      if (!loggedInUser && (supabase.auth as any)._betterAuth?.signIn?.email) {
        try {
          const baRes = await (supabase.auth as any)._betterAuth.signIn.email({ email, password });
          if (!baRes.error && baRes.data?.user) {
            const baUser = baRes.data.user;
            loggedInUser = {
              id: baUser.id,
              email: baUser.email,
              user_metadata: { displayName: baUser.name },
              app_metadata: {},
              aud: "authenticated",
              created_at: baUser.createdAt,
            } as any;
            loggedInSession = {
              access_token: baRes.data.token,
              token_type: "bearer",
              expires_in: 604800,
              user: loggedInUser,
            } as any;
          }
        } catch (baErr) {
          console.error("Better Auth direct signIn fallback error:", baErr);
        }
      }

      if (!loggedInUser) {
        return { error: (res.error as Error) || new Error("Gagal masuk. Periksa kembali email dan password Anda.") };
      }

      // Synchronously update state and localStorage
      setUser(loggedInUser);
      if (loggedInSession) setSession(loggedInSession);
      localStorage.setItem("kokurikuler_auth_user", JSON.stringify(loggedInUser));
      if (loggedInSession) {
        localStorage.setItem("kokurikuler_auth_session", JSON.stringify(loggedInSession));
      }

      // Fetch role before returning
      await fetchRole(loggedInUser.id);

      return { error: null };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out error ignored:", e);
    }
    setUser(null);
    setSession(null);
    setRole(null);
    localStorage.removeItem("kokurikuler_auth_user");
    localStorage.removeItem("kokurikuler_auth_session");
    localStorage.removeItem("kokurikuler_auth_role");
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
