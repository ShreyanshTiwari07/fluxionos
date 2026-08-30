import { Redis } from "ioredis";
import { env } from "./env.js";
import { buildRedisOptions } from "./redis-options.js";

export const redis = new Redis(env.REDIS_URL, buildRedisOptions(env.REDIS_URL));

redis.on("error", (err: Error) => {
  console.error("Redis connection error:", err);
});
