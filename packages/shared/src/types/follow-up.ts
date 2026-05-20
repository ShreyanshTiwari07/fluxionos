import { z } from "zod";
import type { FollowUpStatus } from "../constants/email-status.js";

export const createFollowUpSchema = z.object({
  email_id: z.string().uuid(),
  delay_hours: z.number().int().min(1).max(720),
  follow_up_body: z.string().min(1),
});

export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;

export interface FollowUp {
  id: string;
  email_id: string;
  user_id: string;
  delay_hours: number;
  follow_up_body: string;
  check_at: string | null;
  sent_at: string | null;
  status: FollowUpStatus;
  gmail_message_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}
