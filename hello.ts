import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3-flash"];

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = crypto.scryptSync(password.normalize("NFKC"), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return `${salt}:${key.toString("hex")}`;
}

async function getUserIdFromAuthHeader(sqlInstance: any, authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  // 1. Check if token is a JWT
  if (token.includes(".")) {
    try {
      const parts = token.split(".");
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
        if (payload.sub || payload.userId) return String(payload.sub || payload.userId);
      }
    } catch {
      // not a JWT
    }
  }

  // 2. Check if token is a Better Auth session token in neon_auth.session
  try {
    const sessionRows = await sqlInstance`
      SELECT "userId" FROM neon_auth.session 
      WHERE token = ${token} AND "expiresAt" > NOW() 
      LIMIT 1;
    `;
    if (sessionRows.length > 0 && sessionRows[0]?.userId) {
      return String(sessionRows[0].userId);
    }
  } catch (err) {
    console.error("Error looking up session token:", err);
  }

  return null;
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
      const userId = await getUserIdFromAuthHeader(sql, req.headers.get("Authorization"));
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
      if (type === "test") {
        finalPrompt = "Balas hanya dengan satu kata: 'BERHASIL'";
      } else if (userPrompt) {
        finalPrompt = userPrompt;
      } else {
        finalPrompt = JSON.stringify(requestData || {});
      }

      // Get API Key (tier 1: user, tier 2: admin app_settings, tier 3: env)
      let apiKey = "";
      const profileRows = await sql`
        SELECT api_key FROM public.profiles WHERE user_id = ${userId}::uuid LIMIT 1;
      `;
      if (profileRows[0]?.api_key) apiKey = profileRows[0].api_key;

      if (!apiKey) {
        const settingRows = await sql`
          SELECT value FROM public.app_settings WHERE key = 'gemini_api_key' LIMIT 1;
        `;
        if (settingRows[0]?.value) apiKey = settingRows[0].value;
      }

      if (!apiKey) {
        apiKey = process.env.GEMINI_API_KEY || "";
      }

      if (!apiKey) {
        return new Response(JSON.stringify({
          success: false,
          error: "API Key Gemini belum dikonfigurasi. Hubungi admin atau atur di Pengaturan Akun.",
          errorCode: "missing_api_key",
        }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let generatedText = "";
      let usedModel = "";
      let lastError = "";

      for (const m of GEMINI_MODELS) {
        const res = await callGeminiNative(apiKey, m, finalPrompt);
        if (res.success && res.text) {
          generatedText = res.text;
          usedModel = m;
          break;
        } else {
          lastError = res.error || "Unknown error";
        }
      }

      if (!generatedText) {
        return new Response(JSON.stringify({
          success: false,
          error: `Gagal generate dari semua model: ${lastError}`,
          errorCode: "model_error",
        }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (type !== "test") {
        try {
          await sql`
            INSERT INTO public.generation_logs (user_id, content_type, prompt, created_at)
            VALUES (${userId}::uuid, ${type || "general"}, ${finalPrompt.slice(0, 500)}, NOW());
          `;
        } catch {
          // non-critical
        }
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
      const callerId = await getUserIdFromAuthHeader(sql, req.headers.get("Authorization"));
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
        return new Response(JSON.stringify({ error: "Password minimal 6 karakter" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if user exists in neon_auth.user or profiles
      const userRows = await sql`
        SELECT id, email FROM neon_auth.user WHERE id = ${userId}::uuid LIMIT 1;
      `;
      if (userRows.length === 0) {
        return new Response(JSON.stringify({ error: "User tidak ditemukan" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const userEmail = userRows[0].email;

      // Hash password using Better Auth compatible scrypt
      const hashedPassword = hashPassword(newPassword);

      // Check if credential account already exists in neon_auth.account
      const existingAccount = await sql`
        SELECT id FROM neon_auth.account 
        WHERE "userId" = ${userId}::uuid AND "providerId" = 'credential' 
        LIMIT 1;
      `;

      if (existingAccount.length > 0) {
        await sql`
          UPDATE neon_auth.account
          SET password = ${hashedPassword}, "updatedAt" = NOW()
          WHERE id = ${existingAccount[0].id};
        `;
      } else {
        await sql`
          INSERT INTO neon_auth.account (
            "id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), ${userId}::text, 'credential', ${userId}::uuid, ${hashedPassword}, NOW(), NOW()
          );
        `;
      }

      // Mark allowed_customers as claimed
      await sql`
        UPDATE public.allowed_customers 
        SET is_claimed = true, claimed_at = NOW(), user_id = ${userId}::uuid 
        WHERE user_id = ${userId}::uuid OR lower(email) = lower(${userEmail});
      `;

      return new Response(JSON.stringify({ success: true, message: "Password berhasil direset" }), {
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

  // 3. Claim Account (Set initial password for pre-migrated users)
  if (path.includes("claim-account")) {
    try {
      const { email, password } = (await req.json()) as any;
      if (!email || !password || password.length < 6) {
        return new Response(JSON.stringify({ error: "Password minimal 6 karakter" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if user exists in neon_auth.user
      const userRows = await sql`
        SELECT id, name FROM neon_auth.user WHERE lower(email) = lower(${email}) LIMIT 1;
      `;
      if (userRows.length === 0) {
        return new Response(JSON.stringify({ error: "Email tidak ditemukan atau belum terdaftar." }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const userId = userRows[0].id;

      // Check if credential password already exists
      const existingAccount = await sql`
        SELECT id FROM neon_auth.account WHERE "userId" = ${userId}::uuid AND "providerId" = 'credential' LIMIT 1;
      `;
      if (existingAccount.length > 0) {
        return new Response(JSON.stringify({ error: "Akun ini sudah memiliki password. Silakan masuk dengan password Anda." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Hash password with Better Auth compatible scrypt
      const hashedPassword = hashPassword(password);

      // Insert account
      await sql`
        INSERT INTO neon_auth.account ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${userId}::text, 'credential', ${userId}::uuid, ${hashedPassword}, NOW(), NOW());
      `;

      // Update allowed_customers if present
      await sql`
        UPDATE public.allowed_customers
        SET is_claimed = true, claimed_at = NOW(), user_id = ${userId}::uuid
        WHERE lower(email) = lower(${email});
      `;

      return new Response(JSON.stringify({ success: true }), {
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
