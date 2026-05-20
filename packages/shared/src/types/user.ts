import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  picture_url: z.string().url().nullable(),
  plan: z.enum(["free", "paid"]),
  monthly_send_count: z.number().int().min(0),
  created_at: z.string().datetime(),
});

export type User = z.infer<typeof userSchema>;

export const FREE_TIER_LIMIT = 20;
