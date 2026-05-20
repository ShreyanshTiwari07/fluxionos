export const EMAIL_STATUS = {
  SCHEDULED: "scheduled",
  SENDING: "sending",
  SENT: "sent",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type EmailStatus = (typeof EMAIL_STATUS)[keyof typeof EMAIL_STATUS];

export const FOLLOW_UP_STATUS = {
  PENDING: "pending",
  CHECKING: "checking",
  SENT: "sent",
  CANCELLED: "cancelled",
  FAILED: "failed",
} as const;

export type FollowUpStatus = (typeof FOLLOW_UP_STATUS)[keyof typeof FOLLOW_UP_STATUS];
