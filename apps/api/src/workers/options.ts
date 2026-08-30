import type { WorkerOptions } from "bullmq";
import { redis } from "../config/redis.js";

// Idle BullMQ workers are not free: with the defaults (drainDelay 5s,
// stalledInterval 30s) three workers issue on the order of 50-100k Redis
// commands a day while processing nothing at all, which is what exhausted the
// Upstash free tier's 500k allowance and broke every enqueue.
//
// Both values only govern *idle* chatter, so raising them costs no latency:
// the underlying bzpopmin is a blocking pop that returns the moment a job is
// enqueued, and delayed jobs still wake on their own schedule (BullMQ derives
// the block timeout from the delayed set, ignoring drainDelay, whenever a
// delayed job is pending).
export const WORKER_OPTIONS: WorkerOptions = {
  connection: redis,
  concurrency: 5,
  // Seconds an idle worker blocks waiting for work. Default 5.
  drainDelay: 60,
  // Milliseconds between stalled-job sweeps. Default 30_000. The trade-off is
  // that a job orphaned by a crash waits this long before being retried.
  stalledInterval: 300_000,
};
