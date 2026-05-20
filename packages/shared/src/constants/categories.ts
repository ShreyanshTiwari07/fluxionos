export const DRAFT_CATEGORY = {
  COLD_OUTREACH: "cold_outreach",
  REMINDER: "reminder",
  PERSONAL: "personal",
  UNCATEGORIZED: "uncategorized",
} as const;

export type DraftCategory = (typeof DRAFT_CATEGORY)[keyof typeof DRAFT_CATEGORY];
