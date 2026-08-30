import { describe, it, expect, vi } from "vitest";

// Importing the real client would open a live Redis connection during tests.
vi.mock("../config/redis.js", () => ({ redis: {} }));

const { WORKER_OPTIONS } = await import("./options.js");

// These guard a live incident: BullMQ's defaults (drainDelay 5s,
// stalledInterval 30s) across three workers exhausted Upstash's 500k command
// allowance while the queues were empty, which broke every enqueue.
describe("WORKER_OPTIONS", () => {
  it("blocks well above BullMQ's 5s default when idle", () => {
    expect(WORKER_OPTIONS.drainDelay).toBeGreaterThanOrEqual(30);
  });

  it("sweeps for stalled jobs well above BullMQ's 30s default", () => {
    expect(WORKER_OPTIONS.stalledInterval).toBeGreaterThanOrEqual(120_000);
  });

  it("stays within the free-tier allowance when fully idle", () => {
    const workers = 3;
    const perDay =
      workers * ((86_400 / (WORKER_OPTIONS.drainDelay as number)) +
        (86_400_000 / (WORKER_OPTIONS.stalledInterval as number)));
    // 500k commands across a 31-day month.
    expect(perDay * 31).toBeLessThan(500_000);
  });

  it("keeps the concurrency the workers were tuned for", () => {
    expect(WORKER_OPTIONS.concurrency).toBe(5);
  });
});
