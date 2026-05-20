import { Worker, type Job } from "bullmq";
import { redis } from "../config/redis.js";
import { followUpRepository } from "../repositories/follow-up.repository.js";
import { gmailService } from "../services/gmail.service.js";
import { sendFollowUpQueue, type CheckReplyJobData } from "../queues/email.queue.js";
import { logger } from "../utils/logger.js";

async function processCheckReply(job: Job<CheckReplyJobData>) {
  const { followUpId, emailId, userId, gmailThreadId, gmailMessageId } = job.data;

  logger.info({ followUpId, emailId }, "Checking for reply");

  const followUp = await followUpRepository.findById(followUpId);
  if (!followUp || followUp.status !== "pending") {
    logger.info({ followUpId, status: followUp?.status }, "Follow-up no longer pending, skipping");
    return;
  }

  // Mark as checking
  await followUpRepository.updateStatus(followUpId, "checking");

  try {
    const hasReply = await gmailService.hasReceivedReply(userId, gmailThreadId, gmailMessageId);

    if (hasReply) {
      // Reply received — cancel follow-up
      await followUpRepository.updateStatus(followUpId, "cancelled");
      logger.info({ followUpId }, "Reply detected, follow-up cancelled");
    } else {
      // No reply — queue the follow-up send
      await sendFollowUpQueue.add(`send-followup-${followUpId}`, {
        followUpId,
        emailId,
        userId,
        gmailThreadId,
        gmailMessageId,
      });
      // Revert to pending until the send-follow-up worker processes it
      await followUpRepository.updateStatus(followUpId, "pending");
      logger.info({ followUpId }, "No reply detected, queueing follow-up send");
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    logger.error({ followUpId, error: errMsg }, "Failed to check reply");

    // Revert to pending for retry
    await followUpRepository.updateStatus(followUpId, "pending");
    throw error;
  }
}

export function createCheckReplyWorker() {
  const worker = new Worker("check-reply", processCheckReply, {
    connection: redis,
    concurrency: 5,
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, "Check-reply job failed");
  });

  return worker;
}
