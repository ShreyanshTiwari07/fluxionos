import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const SYSTEM_INSTRUCTION = [
  "You write follow-up emails. The user sent an email and has NOT received a reply.",
  "Write a short, polite, professional follow-up that will be sent as a reply in the same thread.",
  "Requirements:",
  "- Reference the original email's intent naturally; do not repeat it verbatim.",
  "- Keep it concise (2-5 sentences). Warm but not pushy.",
  "- Include a brief greeting and a sign-off.",
  "- Output ONLY the email body as plain text. No subject line, no markdown, no surrounding quotes or commentary.",
].join("\n");

export interface GenerateFollowUpInput {
  subject: string;
  body: string;
  senderName?: string | null;
}

/** Thrown on Gemini failure. `retryable` marks transient errors (429/5xx). */
export class GeminiError extends Error {
  status?: number;
  retryable: boolean;
  constructor(message: string, opts: { status?: number; retryable?: boolean } = {}) {
    super(message);
    this.name = "GeminiError";
    this.status = opts.status;
    this.retryable = opts.retryable ?? false;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const geminiService = {
  isConfigured(): boolean {
    return env.GEMINI_API_KEY.length > 0;
  },

  /**
   * Generates a follow-up email body from the original email's subject and body.
   * Retries transient errors (429 rate limits / 5xx) with backoff. Throws a
   * GeminiError on failure; `retryable` indicates whether a later attempt may
   * succeed (callers decide fallback).
   */
  async generateFollowUpBody(
    input: GenerateFollowUpInput,
    opts: { maxAttempts?: number } = {},
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new GeminiError("Gemini is not configured (missing GEMINI_API_KEY)");
    }

    const prompt = [
      "Original email subject:",
      input.subject,
      "",
      "Original email body:",
      input.body,
      "",
      input.senderName ? `Sign off as: ${input.senderName}` : "",
      "Write the follow-up email body now.",
    ]
      .filter(Boolean)
      .join("\n");

    const url = `${GEMINI_BASE}/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
    const payload = JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
    });

    const maxAttempts = opts.maxAttempts ?? 3;
    let lastErr: GeminiError = new GeminiError("Gemini request failed");

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let res: Response;
      try {
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
      } catch (err) {
        lastErr = new GeminiError(
          `Gemini request failed: ${err instanceof Error ? err.message : "network error"}`,
          { retryable: true },
        );
        if (attempt < maxAttempts) await sleep(backoffMs(attempt));
        continue;
      }

      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
          promptFeedback?: { blockReason?: string };
        };
        if (data.promptFeedback?.blockReason) {
          throw new GeminiError(`Gemini blocked the request: ${data.promptFeedback.blockReason}`);
        }
        const text = data.candidates?.[0]?.content?.parts
          ?.map((p) => p.text || "")
          .join("")
          .trim();
        if (!text) throw new GeminiError("Gemini returned an empty response");
        return text;
      }

      // Non-OK: capture detail and decide whether to retry.
      const detail = await res.text().catch(() => "");
      logger.error({ status: res.status, detail: detail.slice(0, 500) }, "Gemini API error");
      const retryable = res.status === 429 || res.status >= 500;
      lastErr = new GeminiError(geminiMessage(res.status, detail), {
        status: res.status,
        retryable,
      });
      if (!retryable) throw lastErr;

      if (attempt < maxAttempts) {
        const retryAfter = parseRetryAfter(res.headers.get("retry-after"));
        await sleep(retryAfter ?? backoffMs(attempt));
      }
    }

    throw lastErr;
  },
};

/** Exponential-ish backoff capped so the synchronous preview stays responsive. */
function backoffMs(attempt: number): number {
  return Math.min(1500 * 2 ** (attempt - 1), 6000); // 1.5s, 3s, 6s...
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const secs = Number(header);
  if (Number.isFinite(secs)) return Math.min(secs * 1000, 8000);
  return null;
}

function geminiMessage(status: number, detail: string): string {
  if (status === 429) {
    return "Gemini rate limit reached (free tier). Please wait a minute and try again.";
  }
  // Try to surface Gemini's own error message when present.
  try {
    const parsed = JSON.parse(detail) as { error?: { message?: string } };
    if (parsed.error?.message) return `Gemini error: ${parsed.error.message}`;
  } catch {
    /* ignore */
  }
  return `Gemini API returned ${status}`;
}
