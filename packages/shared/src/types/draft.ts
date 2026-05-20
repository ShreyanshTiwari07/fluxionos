import { z } from "zod";
import type { DraftCategory } from "../constants/categories.js";

export const createDraftSchema = z.object({
  to: z.array(z.string().email()).optional(),
  subject: z.string().max(998).optional(),
  body: z.string().optional(),
  category: z.enum(["cold_outreach", "reminder", "personal", "uncategorized"]).optional(),
});

export const updateDraftSchema = createDraftSchema;

export type CreateDraftInput = z.infer<typeof createDraftSchema>;
export type UpdateDraftInput = z.infer<typeof updateDraftSchema>;

export interface Draft {
  id: string;
  user_id: string;
  to: string[] | null;
  subject: string | null;
  body: string | null;
  category: DraftCategory;
  created_at: string;
  updated_at: string;
}
