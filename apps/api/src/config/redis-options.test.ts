import { describe, it, expect } from "vitest";
import { buildRedisOptions } from "./redis-options.js";

describe("buildRedisOptions", () => {
  it("leaves local development over plain TCP untouched", () => {
    const opts = buildRedisOptions("redis://localhost:6380");
    expect(opts.tls).toBeUndefined();
    expect(opts.maxRetriesPerRequest).toBeNull();
  });

  // The bug this guards: layerbase routes by TLS servername and rejects the
  // AUTH with "ERR TLS SNI required" when ioredis connects without SNI.
  it("sets the SNI servername for a rediss:// host", () => {
    const opts = buildRedisOptions("rediss://default:pw@db-abc.layerbase.com:6379");
    expect(opts.tls).toMatchObject({ servername: "db-abc.layerbase.com" });
  });

  it("does not leak the port or credentials into the servername", () => {
    const opts = buildRedisOptions("rediss://default:secret@db-abc.layerbase.com:6379");
    const servername = (opts.tls as { servername: string }).servername;
    expect(servername).not.toMatch(/:|@|secret/);
  });

  it("still enables TLS for an Upstash host given as redis://", () => {
    const opts = buildRedisOptions("redis://default:pw@eu1-abc.upstash.io:6379");
    expect(opts.tls).toMatchObject({ servername: "eu1-abc.upstash.io" });
  });

  it("falls back to safe defaults on an unparseable URL", () => {
    const opts = buildRedisOptions("not a url");
    expect(opts.tls).toBeUndefined();
    expect(opts.maxRetriesPerRequest).toBeNull();
  });
});
