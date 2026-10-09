import { createClient, SupabaseAuthAdapter } from '@neondatabase/neon-js';

const NEON_URL = import.meta.env.VITE_NEON_URL || "https://ep-late-tooth-b36b62mf.c-4.ap-southeast-1.aws.neon.tech/neondb";
const FUNCTION_URL = import.meta.env.VITE_NEON_FUNCTION_URL || "https://br-sparkling-sunset-b3wggorc-api.compute.c-4.ap-southeast-1.aws.neon.tech";

const baseClient = createClient(NEON_URL, {
  auth: {
    adapter: SupabaseAuthAdapter(),
    allowAnonymous: true,
  },
});

export const supabase = Object.assign(baseClient as any, {
  functions: {
    invoke: async (functionName: string, options?: { body?: any; headers?: Record<string, string> }) => {
      try {
        const sessionRes = await baseClient.auth.getSession();
        const token = sessionRes?.data?.session?.access_token;
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