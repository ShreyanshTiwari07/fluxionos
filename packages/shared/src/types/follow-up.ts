import { z } from "zod";
import type { FollowUpStatus } from "../constants/email-status.js";

export const FOLLOW_UP_MODE = ["manual", "ai"] as const;
export type FollowUpMode = (typeof FOLLOW_UP_MODE)[number];

/**
 * Shared shape for configuring a follow-up, used both when scheduling an email
 * (nested) and when adding a follow-up to an existing email.
 *
 * Timing: exactly one of `delay_hours` (relative to send) or `follow_up_at`
 * (absolute time). Mode: `manual` requires `follow_up_body`; `ai` generates it
 * (optionally regenerated at send time when `ai_regenerate` is true).
 */
export const followUpConfigSchema = z
  .object({
    mode: z.enum(FOLLOW_UP_MODE).default("manual"),
    delay_hours: z.number().int().min(1).max(720).optional(),
    follow_up_at: z.string().datetime().optional(),
    follow_up_body: z.string().max(10000).optional(),
    ai_regenerate: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    const hasDelay = data.delay_hours != null;
    const hasAbsolute = data.follow_up_at != null;
    if (hasDelay === hasAbsolute) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide exactly one of delay_hours or follow_up_at",
      });
    }
    if (data.mode === "manual" && !data.follow_up_body?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A follow-up message is required for manual follow-ups",
        path: ["follow_up_body"],
      });
    }
  });

export type FollowUpConfigInput = z.infer<typeof followUpConfigSchema>;

export const createFollowUpSchema = z
  .object({
    email_id: z.string().uuid(),
    mode: z.enum(FOLLOW_UP_MODE).default("manual"),
    delay_hours: z.number().int().min(1).max(720).optional(),
    follow_up_at: z.string().datetime().optional(),
    follow_up_body: z.string().max(10000).optional(),
    ai_regenerate: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    const hasDelay = data.delay_hours != null;
    const hasAbsolute = data.follow_up_at != null;
    if (hasDelay === hasAbsolute) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide exactly one of delay_hours or follow_up_at",
      });
    }
    if (data.mode === "manual" && !data.follow_up_body?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A follow-up message is required for manual follow-ups",
        path: ["follow_up_body"],
      });
    }
  });

export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;

/** Body for the AI follow-up preview endpoint. */
export const aiFollowUpPreviewSchema = z.object({
  subject: z.string().min(1).max(998),
  body: z.string().min(1).max(20000),
});

export type AiFollowUpPreviewInput = z.infer<typeof aiFollowUpPreviewSchema>;

export interface FollowUp {
  id: string;
  email_id: string;
  user_id: string;
  mode: FollowUpMode;
  delay_hours: number | null;
  follow_up_at: string | null;
  ai_regenerate: boolean;
  follow_up_body: string | null;
  check_at: string | null;
  sent_at: string | null;
  status: FollowUpStatus;
  gmail_message_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}
