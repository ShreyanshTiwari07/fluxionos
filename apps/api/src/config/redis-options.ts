import type { RedisOptions } from "ioredis";

/**
 * Builds the ioredis options for a managed Redis URL.
 *
 * Two provider quirks are handled here:
 *
 * 1. TLS. Upstash (and most managed Redis) reject plain TCP, which shows up as
 *    an ECONNRESET loop that hangs BullMQ enqueues rather than a clear error.
 *    Enable TLS when the URL asks for it (rediss://) or points at a known
 *    managed host, even if the scheme was mistakenly given as redis://.
 *
 * 2. SNI. Some providers (layerbase) route connections by TLS servername and
 *    reject the AUTH with "ERR TLS SNI required" when it is absent. ioredis
 *    does not reliably infer servername from the URL, so set it explicitly.
 */
export function buildRedisOptions(rawUrl: string): RedisOptions {
  const base: RedisOptions = { maxRetriesPerRequest: null };

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return base;
  }

  const needsTls = parsed.protocol === "rediss:" || /upstash\.io/.test(parsed.hostname);
  if (!needsTls) return base;

  return {
    ...base,
    tls: {
      // Provider certs are valid, but we skip strict CA verification rather
      // than bundling every provider's root.
      rejectUnauthorized: false,
      servername: parsed.hostname,
    },
  };
}
