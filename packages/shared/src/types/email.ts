import { z } from "zod";
import type { EmailStatus } from "../constants/email-status.js";

export const scheduleEmailSchema = z.object({
  to: z.array(z.string().email()).min(1),
  cc: z.array(z.string().email()).optional(),
  subject: z.string().min(1).max(998),
  body: z.string().min(1),
  scheduled_at: z.string().datetime(),
  follow_up: z
    .object({
      delay_hours: z.number().int().min(1).max(720),
      follow_up_body: z.string().min(1),
    })
    .optional(),
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
