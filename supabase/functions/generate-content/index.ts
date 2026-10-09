import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3-flash"];
const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface GeminiError {
  errorCode: string;
  message: string;
  recoverable: boolean;
}

function parseGeminiError(status: number, body: string): GeminiError {
  const lower = body.toLowerCase();
  if (status === 404 || lower.includes("not_found")) {
    return { errorCode: "model_not_found", message: "Model tidak tersedia", recoverable: true };
  }
  if (status === 429 || lower.includes("resource_exhausted")) {
    if (lower.includes("limit: 0")) {
      return { errorCode: "quota_unavailable", message: "Quota free tier belum aktif (limit: 0)", recoverable: true };
    }
    return { errorCode: "quota_exceeded", message: "Quota API Key habis untuk hari ini", recoverable: true };
  }
  if (status === 401 || status === 403 || lower.includes("permission_denied")) {
    return { errorCode: "invalid_key", message: "API Key tidak valid", recoverable: false };
  }
  if (status === 400) {
    return { errorCode: "bad_request", message: "Format API Key salah", recoverable: false };
  }
  return { errorCode: "unknown", message: `Error ${status}: ${body.slice(0, 200)}`, recoverable: false };
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
): Promise<{ success: boolean; text?: string; error?: GeminiError }> {
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
      return { success: false, error: parseGeminiError(res.status, body) };
    }
    const result = await res.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { success: false, error: { errorCode: "empty_response", message: "No content in response", recoverable: true } };
    return { success: true, text };
  } catch (e) {
    return { success: false, error: { errorCode: "network", message: String(e), recoverable: true } };
  }
}

async function callLovableGateway(
  apiKey: string,
  prompt: string,
  systemPrompt?: string,
  maxTokens = 8192,
  temperature = 0.7
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    const messages: Array<{ role: string; content: string }> = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: prompt });

    const res = await fetch(LOVABLE_GATEWAY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) return { success: false, error: "Rate limit exceeded on gateway" };
      if (res.status === 402) return { success: false, error: "Payment required for gateway" };
      return { success: false, error: `Gateway error ${res.status}: ${body.slice(0, 200)}` };
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) return { success: false, error: "No content in gateway response" };
    return { success: true, text };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

async function tryKeysAndModels(
  keys: string[],
  prompt: string,
  maxOutputTokens: number,
  temperature: number
): Promise<{ success: boolean; text?: string; model?: string; triedModels: string[]; lastError?: GeminiError }> {
  const triedModels: string[] = [];
  let lastError: GeminiError | undefined;

  for (const key of keys) {
    for (const model of GEMINI_MODELS) {
      triedModels.push(model);
      const result = await callGeminiNative(key, model, prompt, maxOutputTokens, temperature);
      if (result.success) return { success: true, text: result.text, model, triedModels };
      lastError = result.error;
      if (!result.error?.recoverable) break; // non-recoverable: skip remaining models for this key
    }
  }
  return { success: false, triedModels, lastError };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized", errorCode: "unauthorized" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized", errorCode: "unauthorized" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Parse body
    const body = await req.json();
    const { type, data: requestData, prompt: userPrompt, systemPrompt } = body;

    // Service role client for reading keys
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check account type
    const { data: customerData } = await adminClient
      .from("allowed_customers")
      .select("account_type")
      .eq("user_id", userId)
      .maybeSingle();

    const accountType = customerData?.account_type || "regular";
    const isTrial = accountType === "trial";

    // Rate limit for trial
    if (isTrial) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count } = await adminClient
        .from("generation_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", today.toISOString());

      const dailyCount = count || 0;
      if (dailyCount >= 10 && type !== "test") {
        return new Response(JSON.stringify({
          success: false,
          error: "Batas harian tercapai (10 konten/hari untuk akun trial)",
          errorCode: "rate_limit_exceeded",
          remaining: 0,
          limit: 10,
          isTrial: true,
        }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Determine prompt
    let finalPrompt: string;
    let maxOutputTokens = 8192;
    let temperature = 0.7;

    if (type === "test") {
      finalPrompt = "Say 'test successful' in 2 words";
      maxOutputTokens = 10;
    } else {
      finalPrompt = userPrompt || JSON.stringify(requestData);
    }

    // Tier 1: Personal keys (skip for trial)
    if (!isTrial) {
      const { data: personalKeys } = await adminClient
        .from("user_api_keys")
        .select("api_key")
        .eq("user_id", userId)
        .eq("is_active", true);

      if (personalKeys && personalKeys.length > 0) {
        const keys = personalKeys.map((k: { api_key: string }) => k.api_key);
        const result = await tryKeysAndModels(keys, finalPrompt, maxOutputTokens, temperature);
        if (result.success) {
          if (type !== "test") {
            await adminClient.from("generation_logs").insert({
              user_id: userId,
              content_type: type || "generation",
              metadata: { model: result.model, tier: "personal" },
            });
          }
          const responseText = result.text!;
          return new Response(JSON.stringify({
            success: true,
            text: responseText,
            model: result.model,
            triedModels: result.triedModels,
            tier: "personal",
            ...(type !== "test" ? { json: extractJsonFromResponse(responseText) } : {}),
          }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        // If all personal keys failed with non-recoverable, return error
        if (result.lastError && !result.lastError.recoverable) {
          return new Response(JSON.stringify({
            success: false,
            error: result.lastError.message,
            errorCode: result.lastError.errorCode,
            triedModels: result.triedModels,
          }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
    }

    // Tier 2: Demo keys (round-robin)
    const { data: demoKeys } = await adminClient
      .from("demo_api_keys")
      .select("api_key")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (demoKeys && demoKeys.length > 0) {
      // Get daily count for round-robin
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: dailyTotal } = await adminClient
        .from("generation_logs")
        .select("id", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      const startIdx = (dailyTotal || 0) % demoKeys.length;
      const orderedKeys: string[] = [];
      for (let i = 0; i < demoKeys.length; i++) {
        orderedKeys.push(demoKeys[(startIdx + i) % demoKeys.length].api_key);
      }

      const result = await tryKeysAndModels(orderedKeys, finalPrompt, maxOutputTokens, temperature);
      if (result.success) {
        if (type !== "test") {
          await adminClient.from("generation_logs").insert({
            user_id: userId,
            content_type: type || "generation",
            metadata: { model: result.model, tier: "demo" },
          });
        }
        const responseText = result.text!;
        return new Response(JSON.stringify({
          success: true,
          text: responseText,
          model: result.model,
          triedModels: result.triedModels,
          tier: "demo",
          ...(type !== "test" ? { json: extractJsonFromResponse(responseText) } : {}),
        }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Tier 3: Lovable AI Gateway
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (lovableKey) {
      const result = await callLovableGateway(lovableKey, finalPrompt, systemPrompt, maxOutputTokens, temperature);
      if (result.success) {
        if (type !== "test") {
          await adminClient.from("generation_logs").insert({
            user_id: userId,
            content_type: type || "generation",
            metadata: { model: "google/gemini-3-flash-preview", tier: "lovable_gateway" },
          });
        }
        const responseText = result.text!;
        return new Response(JSON.stringify({
          success: true,
          text: responseText,
          model: "google/gemini-3-flash-preview",
          tier: "lovable_gateway",
          ...(type !== "test" ? { json: extractJsonFromResponse(responseText) } : {}),
        }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({
        success: false,
        error: result.error || "All tiers failed",
        errorCode: "all_tiers_failed",
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      success: false,
      error: "Tidak ada API key tersedia",
      errorCode: "no_keys_available",
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("generate-content error:", e);
    return new Response(JSON.stringify({
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
      errorCode: "internal_error",
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
