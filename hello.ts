import { neon } from "@neondatabase/serverless";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3-flash"];

function parseJwtSub(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
    return payload.sub || payload.userId || null;
  } catch {
    return null;
  }
}

function sanitizeJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}

function stripMarkdownBold(obj: unknown): unknown {
  if (typeof obj === "string") return obj.replace(/\*\*(.*?)\*\*/g, "$1");
  if (Array.isArray(obj)) return obj.map(stripMarkdownBold);
  if (obj && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) result[k] = stripMarkdownBold(v);
    return result;
  }
  return obj;
}

function extractJsonFromResponse(text: string): unknown | null {
  const cleaned = sanitizeJsonResponse(text);
  try {
    return stripMarkdownBold(JSON.parse(cleaned));
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return stripMarkdownBold(JSON.parse(match[0])); } catch { /* ignore */ }
    }
    return null;
  }
}

async function callGeminiNative(
  apiKey: string,
  model: string,
  prompt: string,
  maxOutputTokens = 8192,
  temperature = 0.7
): Promise<{ success: boolean; text?: string; error?: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { success: false, error: `Gemini HTTP ${res.status}: ${body.slice(0, 150)}` };
    }
    const result = (await res.json()) as any;
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { success: false, error: "Empty text response from Gemini" };
    return { success: true, text };
  } catch (e: any) {
    return { success: false, error: String(e) };
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  // Root or test
  if (path === "/" || path === "/hello") {
    return new Response(JSON.stringify({ message: "Hello from Neon Functions", status: "ok" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const sql = neon(process.env.DATABASE_URL!);

  // 1. Generate Content Function
  if (path.includes("generate-content")) {
    try {
      const userId = parseJwtSub(req.headers.get("Authorization"));
      if (!userId) {
        return new Response(JSON.stringify({ success: false, error: "Unauthorized", errorCode: "unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = (await req.json()) as any;
      const { type, data: requestData, prompt: userPrompt } = body;

      // Rate limit check for trial users
      const customerRows = await sql`
        SELECT account_type FROM public.allowed_customers WHERE user_id = ${userId}::uuid LIMIT 1;
      `;
      const accountType = customerRows[0]?.account_type || "regular";
      const isTrial = accountType === "trial";

      if (isTrial && type !== "test") {
        const countRes = await sql`
          SELECT COUNT(*)::int AS count FROM public.generation_logs
          WHERE user_id = ${userId}::uuid AND created_at >= CURRENT_DATE;
        `;
        const dailyCount = countRes[0]?.count || 0;
        if (dailyCount >= 10) {
          return new Response(JSON.stringify({
            success: false,
            error: "Batas harian tercapai (10 konten/hari untuk akun trial)",
            errorCode: "rate_limit_exceeded",
          }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      let finalPrompt: string;
      let maxOutputTokens = 8192;
      let temperature = 0.7;

      if (type === "test") {
        finalPrompt = "Say 'test successful' in 2 words";
        maxOutputTokens = 10;
      } else {
        finalPrompt = userPrompt || JSON.stringify(requestData);
      }

      // Collect API keys: Personal keys first
      let keysToTry: string[] = [];
      if (!isTrial) {
        const personalKeys = await sql`
          SELECT api_key FROM public.user_api_keys WHERE user_id = ${userId}::uuid AND is_active = true;
        `;
        keysToTry = personalKeys.map((k: any) => k.api_key);
      }

      // Add demo keys
      const demoKeys = await sql`
        SELECT api_key FROM public.demo_api_keys WHERE is_active = true ORDER BY created_at ASC;
      `;
      const demoKeyList = demoKeys.map((k: any) => k.api_key);
      keysToTry.push(...demoKeyList);

      if (keysToTry.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: "Tidak ada API key tersedia. Silakan masukkan Gemini API Key di Pengaturan.",
          errorCode: "no_keys_available",
        }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let generatedText: string | undefined;
      let usedModel: string | undefined;
      let lastError: string | undefined;

      for (const key of keysToTry) {
        for (const model of GEMINI_MODELS) {
          const res = await callGeminiNative(key, model, finalPrompt, maxOutputTokens, temperature);
          if (res.success && res.text) {
            generatedText = res.text;
            usedModel = model;
            break;
          }
          lastError = res.error;
        }
        if (generatedText) break;
      }

      if (!generatedText) {
        return new Response(JSON.stringify({
          success: false,
          error: lastError || "Gagal memproses dengan Gemini API",
          errorCode: "generation_failed",
        }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Save log
      if (type !== "test") {
        await sql`
          INSERT INTO public.generation_logs (user_id, content_type, metadata)
          VALUES (${userId}::uuid, ${type || "generation"}, ${JSON.stringify({ model: usedModel })}::jsonb);
        `;
      }

      return new Response(JSON.stringify({
        success: true,
        text: generatedText,
        model: usedModel,
        ...(type !== "test" ? { json: extractJsonFromResponse(generatedText) } : {}),
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (e: any) {
      return new Response(JSON.stringify({ success: false, error: e.message || String(e) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // 2. Admin Reset Password Function
  if (path.includes("admin-reset-password")) {
    try {
      const callerId = parseJwtSub(req.headers.get("Authorization"));
      if (!callerId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify admin role
      const roleRows = await sql`
        SELECT role FROM public.user_roles WHERE user_id = ${callerId}::uuid LIMIT 1;
      `;
      if (roleRows[0]?.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden - Admin access required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { userId, newPassword } = (await req.json()) as any;
      if (!userId || !newPassword || newPassword.length < 6) {
        return new Response(JSON.stringify({ error: "Invalid password (minimum 6 characters)" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // In Better Auth / neon_auth, users who haven't claimed password yet have is_claimed = false.
      // Resetting marks them as unclaimed so they set password, or update neon_auth.account
      await sql`
        UPDATE public.allowed_customers SET is_claimed = false, claimed_at = NULL WHERE user_id = ${userId}::uuid;
      `;
      await sql`
        DELETE FROM neon_auth.account WHERE "userId" = ${userId}::uuid AND "providerId" = 'credential';
      `;

      return new Response(JSON.stringify({ success: true, message: "User password reset successfully" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message || String(e) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Not Found", { status: 404, headers: corsHeaders });
}
