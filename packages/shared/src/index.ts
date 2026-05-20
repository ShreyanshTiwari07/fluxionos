// Types
export type { User } from "./types/user.js";
export type { Email, ScheduleEmailInput } from "./types/email.js";
export type { FollowUp, CreateFollowUpInput } from "./types/follow-up.js";
export type { Draft, CreateDraftInput, UpdateDraftInput } from "./types/draft.js";
export type { ApiResponse, PaginatedResponse, EmailStats } from "./types/api.js";

// Schemas
export { userSchema, FREE_TIER_LIMIT } from "./types/user.js";
export { scheduleEmailSchema } from "./types/email.js";
export { createFollowUpSchema } from "./types/follow-up.js";
export { createDraftSchema, updateDraftSchema } from "./types/draft.js";

// Constants
export { EMAIL_STATUS, FOLLOW_UP_STATUS } from "./constants/email-status.js";
export type { EmailStatus, FollowUpStatus } from "./constants/email-status.js";
export { DRAFT_CATEGORY } from "./constants/categories.js";
export type { DraftCategory } from "./constants/categories.js";
