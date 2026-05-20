import { createSendEmailWorker } from "./send-email.worker.js";
import { createCheckReplyWorker } from "./check-reply.worker.js";
import { createSendFollowUpWorker } from "./send-follow-up.worker.js";
import { logger } from "../utils/logger.js";

/**
 * Starts all BullMQ workers and wires up graceful shutdown.
 * Used by the standalone worker entry (workers/index.ts) and, on
 * single-service free deploys, by the API process (index.ts).
 */
export function startWorkers() {
  logger.info("Starting FluxionOS workers...");

  const sendEmailWorker = createSendEmailWorker();
  const checkReplyWorker = createCheckReplyWorker();
  const sendFollowUpWorker = createSendFollowUpWorker();

  logger.info("All workers started: send-email, check-reply, send-follow-up");

  async function shutdown() {
    logger.info("Shutting down workers...");
    await Promise.all([
      sendEmailWorker.close(),
      checkReplyWorker.close(),
      sendFollowUpWorker.close(),
    ]);
    logger.info("Workers shut down gracefully");
    process.exit(0);
  }

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return { sendEmailWorker, checkReplyWorker, sendFollowUpWorker };
}
