import { Redis } from "ioredis";
import { env } from "./env.js";

// Upstash (and most managed Redis) require TLS. Connecting over plain TCP gets
// instantly reset (ECONNRESET loop), which hangs BullMQ enqueues. Enable TLS
// when the URL asks for it (rediss://) or points at a known managed host, even
// if the scheme was mistakenly given as redis://.
const url = env.REDIS_URL;
const needsTls = url.startsWith("rediss://") || /upstash\.io/.test(url);

export const redis = new Redis(url, {
  maxRetriesPerRequest: null,
  ...(needsTls ? { tls: { rejectUnauthorized: false } } : {}),
});

redis.on("error", (err: Error) => {
  console.error("Redis connection error:", err);
});
