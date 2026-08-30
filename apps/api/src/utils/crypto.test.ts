import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { encrypt, decrypt } from "./crypto.js";

describe("encrypt/decrypt", () => {
  it("round-trips a token", () => {
    const token = "ya29.a0AfB_byC-example-oauth-token";
    expect(decrypt(encrypt(token))).toBe(token);
  });

  it("round-trips an empty string (users without a refresh token)", () => {
    expect(decrypt(encrypt(""))).toBe("");
  });

  it("produces a distinct ciphertext each time (random IV)", () => {
    expect(encrypt("same")).not.toBe(encrypt("same"));
  });

  it("rejects malformed ciphertext", () => {
    expect(() => decrypt("not-a-valid-payload")).toThrow(/Invalid encrypted text format/);
  });

  // Documents why validateEnv exists: aes-256-gcm rejects a short key outright.
  it("cannot build a cipher from a 32-character (non-hex-decoded) key", () => {
    const shortKey = Buffer.from("a".repeat(32), "hex");
    expect(() =>
      crypto.createCipheriv("aes-256-gcm", shortKey, crypto.randomBytes(12)),
    ).toThrow();
  });
});
