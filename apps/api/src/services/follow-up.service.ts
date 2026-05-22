import { followUpRepository } from "../repositories/follow-up.repository.js";
import { emailRepository } from "../repositories/email.repository.js";
import { checkReplyQueue } from "../queues/email.queue.js";
import { AppError } from "../middleware/error-handler.js";
import { logger } from "../utils/logger.js";
import type { FollowUpStatus } from "@fluxionos/shared";

export const followUpService = {
  async createFollowUp(
    userId: string,
    data: {
      email_id: string;
      mode?: "manual" | "ai";
      delay_hours?: number;
      follow_up_at?: string;
      follow_up_body?: string;
      ai_regenerate?: boolean;
    },
  ) {
    const email = await emailRepository.findById(data.email_id);
    if (!email || email.user_id !== userId) {
      throw new AppError(404, "Email not found");
    }

    // Check if email already has a follow-up
    const existing = await followUpRepository.findByEmailId(data.email_id);
    if (existing) {
      throw new AppError(400, "This email already has a follow-up configured");
    }

    // Only allow follow-ups on scheduled or sent emails
    if (email.status !== "scheduled" && email.status !== "sent") {
      throw new AppError(400, "Follow-ups can only be added to scheduled or sent emails");
    }

    const followUpAt = data.follow_up_at ? new Date(data.follow_up_at) : null;

    const followUp = await followUpRepository.create({
      email_id: data.email_id,
      user_id: userId,
      mode: data.mode ?? "manual",
      delay_hours: data.delay_hours ?? null,
      follow_up_at: followUpAt,
      ai_regenerate: data.ai_regenerate ?? false,
      follow_up_body: data.follow_up_body ?? null,
    });

    // If the email is already sent, schedule the reply check now
    if (email.status === "sent" && email.gmail_thread_id && email.gmail_message_id) {
      // Absolute time if provided, otherwise relative to now.
      const checkAt = followUpAt ?? new Date(Date.now() + (data.delay_hours ?? 0) * 3600 * 1000);
      const delay = Math.max(0, checkAt.getTime() - Date.now());

      await followUpRepository.updateStatus(followUp.id, "pending", { check_at: checkAt });

      await checkReplyQueue.add(
        `check-reply-${followUp.id}`,
        {
          followUpId: followUp.id,
          emailId: data.email_id,
          userId,
          gmailThreadId: email.gmail_thread_id,
          gmailMessageId: email.gmail_message_id,
        },
        { delay },
      );

      logger.info({ followUpId: followUp.id, checkAt: checkAt.toISOString() }, "Reply check scheduled for existing sent email");
    }

    return followUp;
  },

  async listFollowUps(
    userId: string,
    options: { status?: FollowUpStatus; page?: number; limit?: number },
  ) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 50);
    const offset = (page - 1) * limit;

    const { followUps, total } = await followUpRepository.findByUserId(userId, {
      status: options.status,
      limit,
      offset,
    });

    return {
      followUps,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  },

  async cancelFollowUp(userId: string, followUpId: string) {
    const followUp = await followUpRepository.findById(followUpId);
    if (!followUp || followUp.user_id !== userId) {
      throw new AppError(404, "Follow-up not found");
    }

    if (followUp.status !== "pending") {
      throw new AppError(400, "Only pending follow-ups can be cancelled");
    }

    await followUpRepository.updateStatus(followUpId, "cancelled");
    logger.info({ followUpId }, "Follow-up cancelled by user");
    return { message: "Follow-up cancelled" };
  },
};
