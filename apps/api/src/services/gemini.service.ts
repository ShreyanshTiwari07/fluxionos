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

export const geminiService = {
  isConfigured(): boolean {
    return env.GEMINI_API_KEY.length > 0;
  },

  /**
   * Generates a follow-up email body from the original email's subject and body.
   * Throws on missing configuration or any API failure (callers decide fallback).
   */
  async generateFollowUpBody(input: GenerateFollowUpInput): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error("Gemini is not configured (missing GEMINI_API_KEY)");
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

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
        }),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "network error";
      throw new Error(`Gemini request failed: ${msg}`);
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      logger.error({ status: res.status, detail: detail.slice(0, 500) }, "Gemini API error");
      throw new Error(`Gemini API returned ${res.status}`);
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      promptFeedback?: { blockReason?: string };
    };

    if (data.promptFeedback?.blockReason) {
      throw new Error(`Gemini blocked the request: ${data.promptFeedback.blockReason}`);
    }

    const text = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim();

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    return text;
  },
};
