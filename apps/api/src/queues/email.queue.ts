import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

export interface SendEmailJobData {
  emailId: string;
  userId: string;
}

export interface CheckReplyJobData {
  followUpId: string;
  emailId: string;
  userId: string;
  gmailThreadId: string;
  gmailMessageId: string;
}

export interface SendFollowUpJobData {
  followUpId: string;
  emailId: string;
  userId: string;
  gmailThreadId: string;
  gmailMessageId: string;
}

export const sendEmailQueue = new Queue<SendEmailJobData>("send-email", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 60000, // 1 minute base
    },
    removeOnComplete: { age: 7 * 24 * 3600 },
    removeOnFail: { age: 30 * 24 * 3600 },
  },
});

export const checkReplyQueue = new Queue<CheckReplyJobData>("check-reply", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 60000,
    },
    removeOnComplete: { age: 7 * 24 * 3600 },
    removeOnFail: { age: 30 * 24 * 3600 },
  },
});

export const sendFollowUpQueue = new Queue<SendFollowUpJobData>("send-follow-up", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 60000,
    },
    removeOnComplete: { age: 7 * 24 * 3600 },
    removeOnFail: { age: 30 * 24 * 3600 },
  },
});
