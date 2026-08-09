import { ApiError } from "@/lib/api-response";

// Try to extract & repair JSON from an LLM response.
// GLM-5.2 with thinking mode occasionally emits slightly malformed JSON,
// so we try several recovery strategies before giving up.
function extractJson(text: string): any {
  // 1. Direct parse
  try { return JSON.parse(text); } catch {}

  // 2. Grab the outermost {...} block and parse
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }

  // 3. Repair common issues: trailing commas, duplicated/misplaced keys,
  //    and truncated arrays. We strip trailing commas before } or ].
  if (match) {
    const repaired = match[0]
      .replace(/,\s*([}\]])/g, "$1") // trailing commas
      .replace(/"[^"]*"\s*:\s*"[^"]*"\s*\n\s*"[^"]*"\s*:/g, (m) => m.replace(/\n\s*"[^"]*"\s*:/, "")) // duplicated stray value
      ;
    try { return JSON.parse(repaired); } catch {}
  }

  // 4. Last resort: return a minimal object so callers don't crash,
  //    but surface the raw text for debugging.
  throw new ApiError("LLM returned non-JSON output", 502, text.slice(0, 800));
}

export async function callQwenJson<T>(prompt: string): Promise<T> {
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) throw new ApiError("QWEN_API_KEY is not configured", 500);

  const model = process.env.QWEN_MODEL || "glm-5.2";
  // DashScope international OpenAI-compatible endpoint
  const baseUrl = (process.env.QWEN_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1").replace(/\/$/, "");
  const url = `${baseUrl}/chat/completions`;

  // GLM-5.2 is a reasoning model. Thinking mode can take 60-120s+ and
  // sometimes corrupts JSON output, so we disable it for structured tasks.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000);

  try {
    console.log(`[LLM] Calling ${model} at ${url}`);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" },
        // Disable reasoning/thinking for faster, cleaner JSON output
        enable_thinking: false,
        // Cap output length to avoid runaway responses
        max_tokens: 4000,
      }),
      signal: controller.signal,
    });

    const data = await res.json().catch(async () => {
      const raw = await res.text();
      return { raw };
    });

    if (!res.ok) {
      const msg = data?.error?.message || data?.error?.code || JSON.stringify(data).slice(0, 300);
      console.error(`[LLM] Error ${res.status}:`, msg);
      throw new ApiError(`LLM API error ${res.status}: ${msg}`, 502, data);
    }

    const content = data?.choices?.[0]?.message?.content ?? data?.output_text ?? data?.raw;
    if (!content) {
      console.error("[LLM] No content in response:", JSON.stringify(data).slice(0, 300));
      throw new ApiError("LLM response missing content", 502, data);
    }

    console.log(`[LLM] Success — tokens used: ${data?.usage?.total_tokens ?? "unknown"}`);
    return (typeof content === "string" ? extractJson(content) : content) as T;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    if (error?.name === "AbortError") {
      throw new ApiError("LLM request timed out after 180s", 504);
    }
    console.error("[LLM] Fetch error:", error?.message || error);
    throw new ApiError(`Failed to call ${model}: ${error?.message || error}`, 502);
  } finally {
    clearTimeout(timeout);
  }
}

export async function callQwenChat(systemPrompt: string, messages: Array<{role: string; content: string}>): Promise<string> {
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) throw new ApiError("QWEN_API_KEY is not configured", 500);

  const model = process.env.QWEN_MODEL || "glm-5.2";
  const baseUrl = (process.env.QWEN_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1").replace(/\/$/, "");
  const url = `${baseUrl}/chat/completions`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000);

  try {
    console.log(`[LLM] Calling ${model} at ${url} for chat`);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.7,
        enable_thinking: false,
        max_tokens: 3000,
      }),
      signal: controller.signal,
    });

    const data = await res.json().catch(async () => {
      const raw = await res.text();
      return { raw };
    });

    if (!res.ok) {
      const msg = data?.error?.message || data?.error?.code || JSON.stringify(data).slice(0, 300);
      console.error(`[LLM] Error ${res.status}:`, msg);
      throw new ApiError(`LLM API error ${res.status}: ${msg}`, 502, data);
    }

    const content = data?.choices?.[0]?.message?.content ?? data?.output_text ?? data?.raw;
    if (!content) {
      console.error("[LLM] No content in response:", JSON.stringify(data).slice(0, 300));
      throw new ApiError("LLM response missing content", 502, data);
    }

    console.log(`[LLM] Chat success — tokens used: ${data?.usage?.total_tokens ?? "unknown"}`);
    return (typeof content === "string" ? content : String(content));
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    if (error?.name === "AbortError") {
      throw new ApiError("LLM request timed out after 180s", 504);
    }
    console.error("[LLM] Fetch error:", error?.message || error);
    throw new ApiError(`Failed to call ${model}: ${error?.message || error}`, 502);
  } finally {
    clearTimeout(timeout);
  }
}
