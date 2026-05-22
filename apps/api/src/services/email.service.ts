import { emailRepository } from "../repositories/email.repository.js";
import { followUpRepository } from "../repositories/follow-up.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { sendEmailQueue } from "../queues/email.queue.js";
import { FREE_TIER_LIMIT, type EmailStatus } from "@fluxionos/shared";
import { AppError } from "../middleware/error-handler.js";
import { logger } from "../utils/logger.js";

export const emailService = {
  async scheduleEmail(
    userId: string,
    data: {
      to: string[];
      cc?: string[];
      subject: string;
      body: string;
      scheduled_at: string;
      follow_up?: {
        mode?: "manual" | "ai";
        delay_hours?: number;
        follow_up_at?: string;
        follow_up_body?: string;
        ai_regenerate?: boolean;
      };
    },
  ) {
    // Check quota
    await userRepository.resetSendCountIfNeeded(userId);
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "User not found");

    if (user.plan === "free" && user.monthly_send_count >= FREE_TIER_LIMIT) {
      throw new AppError(
        403,
        `Free tier limit reached (${FREE_TIER_LIMIT} emails/month). Upgrade to continue.`,
      );
    }

    const scheduledAt = new Date(data.scheduled_at);
    if (scheduledAt.getTime() <= Date.now()) {
      throw new AppError(400, "Scheduled time must be in the future");
    }

    // Create email record
    const email = await emailRepository.create({
      user_id: userId,
      to: data.to,
      cc: data.cc,
      subject: data.subject,
      body: data.body,
      scheduled_at: scheduledAt,
    });

    // Create follow-up if requested
    if (data.follow_up) {
      const fu = data.follow_up;
      await followUpRepository.create({
        email_id: email.id,
        user_id: userId,
        mode: fu.mode ?? "manual",
        delay_hours: fu.delay_hours ?? null,
        follow_up_at: fu.follow_up_at ? new Date(fu.follow_up_at) : null,
        ai_regenerate: fu.ai_regenerate ?? false,
        follow_up_body: fu.follow_up_body ?? null,
      });
    }

    // Queue the send job with delay
    const delay = scheduledAt.getTime() - Date.now();
    await sendEmailQueue.add(
      `send-email-${email.id}`,
      { emailId: email.id, userId },
      { delay },
    );

    logger.info(
      { emailId: email.id, scheduledAt: scheduledAt.toISOString(), delay },
      "Email scheduled",
    );

    return email;
  },

  async listEmails(
    userId: string,
    options: { status?: EmailStatus; page?: number; limit?: number },
  ) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 50);
    const offset = (page - 1) * limit;

    const { emails, total } = await emailRepository.findByUserId(userId, {
      status: options.status,
      limit,
      offset,
    });

    // Also fetch follow-up info for each email
    const emailsWithFollowUps = await Promise.all(
      emails.map(async (email) => {
        const followUp = await followUpRepository.findByEmailId(email.id);
        return {
          ...email,
          follow_up: followUp
            ? {
                id: followUp.id,
                mode: followUp.mode,
                delay_hours: followUp.delay_hours,
                follow_up_at: followUp.follow_up_at,
                status: followUp.status,
                check_at: followUp.check_at,
              }
            : null,
        };
      }),
    );

    return {
      emails: emailsWithFollowUps,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  },

  async getEmail(userId: string, emailId: string) {
    const email = await emailRepository.findById(emailId);
    if (!email || email.user_id !== userId) {
      throw new AppError(404, "Email not found");
    }

    const followUp = await followUpRepository.findByEmailId(emailId);
    return {
      ...email,
      follow_up: followUp || null,
    };
  },

  async cancelEmail(userId: string, emailId: string) {
    const email = await emailRepository.findById(emailId);
    if (!email || email.user_id !== userId) {
      throw new AppError(404, "Email not found");
    }

    if (email.status !== "scheduled") {
      throw new AppError(400, "Only scheduled emails can be cancelled");
    }

    await emailRepository.updateStatus(emailId, "cancelled");

    // Also cancel any pending follow-up
    const followUp = await followUpRepository.findByEmailId(emailId);
    if (followUp && followUp.status === "pending") {
      await followUpRepository.updateStatus(followUp.id, "cancelled");
    }

    logger.info({ emailId }, "Email cancelled");
    return { message: "Email cancelled" };
  },

  async getStats(userId: string) {
    await userRepository.resetSendCountIfNeeded(userId);
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "User not found");

    const stats = await emailRepository.getStats(userId);
    const remainingQuota =
      user.plan === "free" ? Math.max(0, FREE_TIER_LIMIT - user.monthly_send_count) : -1;

    return {
      ...stats,
      remaining_quota: remainingQuota,
    };
  },
};
