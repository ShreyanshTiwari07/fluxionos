import { describe, it, expect } from "vitest";
import { validateEnv } from "./env.js";

const base = {
  NODE_ENV: "development",
  ENCRYPTION_KEY: "a".repeat(64),
  JWT_SECRET: "some-secret",
  JWT_REFRESH_SECRET: "some-refresh-secret",
  GOOGLE_CLIENT_ID: "client-id",
};

describe("validateEnv", () => {
  it("accepts a 64-character hex key", () => {
    expect(() => validateEnv(base)).not.toThrow();
  });

  it("accepts uppercase hex", () => {
    expect(() => validateEnv({ ...base, ENCRYPTION_KEY: "A".repeat(64) })).not.toThrow();
  });

  // The bug this guards: a 32-character passphrase looks right but
  // Buffer.from(x, "hex") truncates it, so aes-256-gcm throws mid-request.
  it("rejects a 32-character key", () => {
    expect(() => validateEnv({ ...base, ENCRYPTION_KEY: "a".repeat(32) })).toThrow(
      /ENCRYPTION_KEY must be 64 hex characters/,
    );
  });

  it("rejects non-hex characters", () => {
    expect(() => validateEnv({ ...base, ENCRYPTION_KEY: "z".repeat(64) })).toThrow(
      /ENCRYPTION_KEY/,
    );
  });

  it("rejects an empty key", () => {
    expect(() => validateEnv({ ...base, ENCRYPTION_KEY: "" })).toThrow(/ENCRYPTION_KEY/);
  });

  it("reports the actual length so the fix is obvious", () => {
    expect(() => validateEnv({ ...base, ENCRYPTION_KEY: "abc" })).toThrow(/got 3 character/);
  });

  it("allows the all-zero default outside production", () => {
    expect(() => validateEnv({ ...base, ENCRYPTION_KEY: "0".repeat(64) })).not.toThrow();
  });

  it("rejects the all-zero default in production", () => {
    expect(() =>
      validateEnv({ ...base, NODE_ENV: "production", ENCRYPTION_KEY: "0".repeat(64) }),
    ).toThrow(/all-zero development default/);
  });

  it("warns, but does not throw, on development JWT secrets in production", () => {
    const warnings = validateEnv({
      ...base,
      NODE_ENV: "production",
      JWT_SECRET: "dev-jwt-secret-change-in-production",
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/JWT_SECRET/);
  });

  it("warns when Google sign-in is unconfigured in production", () => {
    const warnings = validateEnv({ ...base, NODE_ENV: "production", GOOGLE_CLIENT_ID: "" });
    expect(warnings).toEqual([expect.stringMatching(/GOOGLE_CLIENT_ID/)]);
  });

  it("returns no warnings for a well-formed production config", () => {
    expect(validateEnv({ ...base, NODE_ENV: "production" })).toEqual([]);
  });
});
