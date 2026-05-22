import { Worker, type Job } from "bullmq";
import { redis } from "../config/redis.js";
import { emailRepository } from "../repositories/email.repository.js";
import { followUpRepository } from "../repositories/follow-up.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { gmailService } from "../services/gmail.service.js";
import { checkReplyQueue, type SendEmailJobData } from "../queues/email.queue.js";
import { logger } from "../utils/logger.js";

async function processSendEmail(job: Job<SendEmailJobData>) {
  const { emailId, userId } = job.data;

  logger.info({ emailId, userId, attempt: job.attemptsMade + 1 }, "Processing send-email job");

  // Load email and verify it's still scheduled
  const email = await emailRepository.findById(emailId);
  if (!email) {
    logger.warn({ emailId }, "Email not found, skipping");
    return;
  }

  if (email.status !== "scheduled") {
    logger.info({ emailId, status: email.status }, "Email no longer scheduled, skipping");
    return;
  }

  // Mark as sending
  await emailRepository.updateStatus(emailId, "sending");

  try {
    // Send via Gmail
    const result = await gmailService.sendEmail(userId, {
      to: email.to,
      cc: email.cc || undefined,
      subject: email.subject,
      body: email.body,
    });

    // Update email record
    await emailRepository.updateStatus(emailId, "sent", {
      sent_at: new Date(),
      gmail_message_id: result.messageId,
      gmail_thread_id: result.threadId,
    });

    // Increment user send count
    await userRepository.incrementSendCount(userId);

    logger.info({ emailId, messageId: result.messageId }, "Email sent successfully");

    // Check if there's a follow-up to schedule
    const followUp = await followUpRepository.findByEmailId(emailId);
    if (followUp && followUp.status === "pending") {
      // Absolute follow-up time wins; otherwise it's relative to send time.
      const checkAt = followUp.follow_up_at
        ? new Date(followUp.follow_up_at)
        : new Date(Date.now() + (followUp.delay_hours ?? 0) * 3600 * 1000);
      const delay = Math.max(0, checkAt.getTime() - Date.now());

      await followUpRepository.updateStatus(followUp.id, "pending", {
        check_at: checkAt,
      });

      await checkReplyQueue.add(
        `check-reply-${followUp.id}`,
        {
          followUpId: followUp.id,
          emailId,
          userId,
          gmailThreadId: result.threadId,
          gmailMessageId: result.messageId,
        },
        { delay },
      );

      logger.info(
        { followUpId: followUp.id, checkAt: checkAt.toISOString() },
        "Scheduled reply check for follow-up",
      );
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    logger.error({ emailId, error: errMsg }, "Failed to send email");

    await emailRepository.incrementRetry(emailId);

    // If this was the last attempt, mark as failed
    if (job.attemptsMade + 1 >= (job.opts.attempts || 3)) {
      await emailRepository.updateStatus(emailId, "failed", {
        error_message: errMsg,
      });
    } else {
      // Revert to scheduled for retry
      await emailRepository.updateStatus(emailId, "scheduled");
    }

    throw error; // Let BullMQ handle the retry
  }
}

export function createSendEmailWorker() {
  const worker = new Worker("send-email", processSendEmail, {
    connection: redis,
    concurrency: 5,
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, "Send-email job failed");
  });

  worker.on("completed", (job) => {
    logger.debug({ jobId: job.id }, "Send-email job completed");
  });

  return worker;
}
