import { z } from "zod";
import type { EmailStatus } from "../constants/email-status.js";
import { followUpConfigSchema } from "./follow-up.js";

export const scheduleEmailSchema = z
  .object({
    to: z.array(z.string().email()).min(1),
    cc: z.array(z.string().email()).optional(),
    subject: z.string().min(1).max(998),
    body: z.string().min(1),
    scheduled_at: z.string().datetime(),
    follow_up: followUpConfigSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // An absolute follow-up time must be after the email is scheduled to send.
    if (data.follow_up?.follow_up_at) {
      const followAt = new Date(data.follow_up.follow_up_at).getTime();
      const sendAt = new Date(data.scheduled_at).getTime();
      if (followAt <= sendAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Follow-up time must be after the email's scheduled time",
          path: ["follow_up", "follow_up_at"],
        });
      }
    }
  });

export type ScheduleEmailInput = z.infer<typeof scheduleEmailSchema>;

export interface Email {
  id: string;
  user_id: string;
  to: string[];
  cc: string[] | null;
  subject: string;
  body: string;
  scheduled_at: string;
  sent_at: string | null;
  status: EmailStatus;
  gmail_message_id: string | null;
  gmail_thread_id: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
}
