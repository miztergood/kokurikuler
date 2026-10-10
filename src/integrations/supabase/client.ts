import { createClient, SupabaseAuthAdapter } from '@neondatabase/neon-js';

const NEON_URL = import.meta.env.VITE_NEON_URL || "https://ep-late-tooth-b36b62mf.c-4.ap-southeast-1.aws.neon.tech/neondb";
const FUNCTION_URL = import.meta.env.VITE_NEON_FUNCTION_URL || "https://br-sparkling-sunset-b3wggorc-api.compute.c-4.ap-southeast-1.aws.neon.tech";

const customFetch: typeof fetch = async (input, init) => {
  let headers = new Headers(init?.headers);
  const authHeader = headers.get("Authorization");
  if (!authHeader || authHeader.includes("undefined")) {
    try {
      const saved = localStorage.getItem("kokurikuler_auth_session");
      if (saved) {
        const token = JSON.parse(saved)?.access_token;
        if (token) headers.set("Authorization", `Bearer ${token}`);
      }
    } catch {}
  }
  return fetch(input, { ...init, headers });
};

const baseClient = createClient(NEON_URL, {
  auth: {
    adapter: SupabaseAuthAdapter(),
    allowAnonymous: true,
  },
  dataApi: {
    options: {
      global: {
        fetch: customFetch,
      },
    },
  },
} as any);

// Wrap getSession and getUser to fallback to localStorage if cookies are blocked (e.g. incognito)
const originalGetSession = baseClient.auth.getSession.bind(baseClient.auth);
baseClient.auth.getSession = async (options?: any) => {
  const res = await originalGetSession(options);
  if (res?.data?.session) return res;
  try {
    const saved = localStorage.getItem("kokurikuler_auth_session");
    if (saved) {
      const session = JSON.parse(saved);
      return { data: { session }, error: null };
    }
  } catch {}
  return res;
};

const originalGetUser = baseClient.auth.getUser.bind(baseClient.auth);
baseClient.auth.getUser = async () => {
  const res = await originalGetUser();
  if (res?.data?.user) return res;
  try {
    const saved = localStorage.getItem("kokurikuler_auth_user");
    if (saved) {
      const user = JSON.parse(saved);
      return { data: { user }, error: null };
    }
  } catch {}
  return res;
};

export const supabase = Object.assign(baseClient as any, {
  functions: {
    invoke: async (functionName: string, options?: { body?: any; headers?: Record<string, string> }) => {
      try {
        const sessionRes = await baseClient.auth.getSession();
        let token = sessionRes?.data?.session?.access_token;
        if (!token) {
          try {
            const saved = localStorage.getItem("kokurikuler_auth_session");
            if (saved) token = JSON.parse(saved)?.access_token;
          } catch {}
        }
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options?.headers,
        };
        const response = await fetch(`${FUNCTION_URL}/${functionName}`, {
          method: "POST",
          headers,
          body: options?.body ? JSON.stringify(options.body) : undefined,
        });
        if (!response.ok) {
          const errText = await response.text();
          let errJson: any;
          try { errJson = JSON.parse(errText); } catch { /* ignore */ }
          return { data: null, error: new Error(errJson?.error || errText || `Error ${response.status}`) };
        }
        const data = await response.json();
        return { data, error: null };
      } catch (err: any) {
        return { data: null, error: err };
      }
    },
  },
});