import { Worker, type Job } from "bullmq";
import { redis } from "../config/redis.js";
import { emailRepository } from "../repositories/email.repository.js";
import { followUpRepository } from "../repositories/follow-up.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { gmailService } from "../services/gmail.service.js";
import { geminiService, GeminiError } from "../services/gemini.service.js";
import type { SendFollowUpJobData } from "../queues/email.queue.js";
import { logger } from "../utils/logger.js";

async function processSendFollowUp(job: Job<SendFollowUpJobData>) {
  const { followUpId, emailId, userId, gmailThreadId, gmailMessageId } = job.data;

  logger.info({ followUpId, emailId }, "Sending follow-up email");

  const followUp = await followUpRepository.findById(followUpId);
  if (!followUp || followUp.status === "cancelled" || followUp.status === "sent") {
    logger.info({ followUpId, status: followUp?.status }, "Follow-up already processed, skipping");
    return;
  }

  const email = await emailRepository.findById(emailId);
  if (!email) {
    logger.warn({ emailId }, "Original email not found");
    return;
  }

  // Resolve the body to send. For AI follow-ups, regenerate at send time when
  // requested (preview left untouched) or when no body was stored. If Gemini
  // fails, mark the follow-up failed and do NOT send anything.
  let body = followUp.follow_up_body ?? "";
  if (followUp.mode === "ai" && (followUp.ai_regenerate || !body.trim())) {
    try {
      body = await geminiService.generateFollowUpBody({
        subject: email.subject,
        body: email.body,
      });
      // Persist the generated body for the record.
      await followUpRepository.updateStatus(followUpId, "pending", { follow_up_body: body });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI generation failed";
      const retryable = err instanceof GeminiError && err.retryable;
      const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts || 3);

      // Transient (e.g. 429 rate limit): let BullMQ retry with backoff.
      if (retryable && !isLastAttempt) {
        logger.warn({ followUpId, error: msg }, "AI generation transient error; will retry");
        throw err;
      }

      logger.error({ followUpId, error: msg }, "AI follow-up generation failed; not sending");
      await followUpRepository.updateStatus(followUpId, "failed", {
        error_message: `AI generation failed: ${msg}`,
      });
      return; // Skip & mark failed — no email sent.
    }
  }

  if (!body.trim()) {
    logger.warn({ followUpId }, "Follow-up has no body to send; marking failed");
    await followUpRepository.updateStatus(followUpId, "failed", {
      error_message: "No follow-up body available to send",
    });
    return;
  }

  try {
    // Get the Message-ID header for proper threading
    const messageIdHeader = await gmailService.getMessageHeader(
      userId,
      gmailMessageId,
      "Message-ID",
    );

    // Send as a reply in the same thread
    const result = await gmailService.sendEmail(userId, {
      to: email.to,
      subject: `Re: ${email.subject}`,
      body,
      threadId: gmailThreadId,
      inReplyTo: messageIdHeader || undefined,
      references: messageIdHeader || undefined,
    });

    await followUpRepository.updateStatus(followUpId, "sent", {
      sent_at: new Date(),
      gmail_message_id: result.messageId,
    });

    await userRepository.incrementSendCount(userId);

    logger.info({ followUpId, messageId: result.messageId }, "Follow-up sent successfully");
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    logger.error({ followUpId, error: errMsg }, "Failed to send follow-up");

    if (job.attemptsMade + 1 >= (job.opts.attempts || 3)) {
      await followUpRepository.updateStatus(followUpId, "failed", {
        error_message: errMsg,
      });
    }

    throw error;
  }
}

export function createSendFollowUpWorker() {
  const worker = new Worker("send-follow-up", processSendFollowUp, {
    connection: redis,
    concurrency: 5,
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, "Send-follow-up job failed");
  });

  return worker;
}
