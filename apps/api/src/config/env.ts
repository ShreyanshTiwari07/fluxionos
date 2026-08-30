import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from project root (../../.. from config/)
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  // Render (and most PaaS) inject the port to bind via PORT.
  API_PORT: parseInt(process.env.PORT || process.env.API_PORT || "3001", 10),
  WEB_URL: process.env.WEB_URL || "http://localhost:3000",

  // When true, the API process also runs the background workers in-process.
  // Lets a single free service host both the API and the BullMQ workers.
  RUN_WORKERS: process.env.RUN_WORKERS === "true",

  // Database
  DATABASE_URL:
    process.env.DATABASE_URL || "postgresql://sendwise:sendwise@localhost:5432/sendwise",

  // Redis
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6380",

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_REDIRECT_URI:
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:3001/api/auth/google/callback",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "dev-jwt-secret-change-in-production",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-in-production",

  // Encryption
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || "0".repeat(64),

  // Gemini (AI-powered follow-ups)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.0-flash",
} as const;

// aes-256-gcm needs exactly 32 bytes of key material. Buffer.from(x, "hex")
// silently truncates anything that isn't valid hex, so a mistyped key doesn't
// fail here — it fails deep inside the OAuth callback as an opaque 500. Check
// it at boot instead.
const HEX_64 = /^[0-9a-f]{64}$/i;

type ValidatedEnv = Pick<
  typeof env,
  "NODE_ENV" | "ENCRYPTION_KEY" | "JWT_SECRET" | "JWT_REFRESH_SECRET" | "GOOGLE_CLIENT_ID"
>;

/**
 * Fails fast on env that would otherwise surface as a runtime 500. Returns
 * non-fatal warnings so the caller can log them.
 */
export function validateEnv(e: ValidatedEnv = env): string[] {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!HEX_64.test(e.ENCRYPTION_KEY)) {
    errors.push(
      `ENCRYPTION_KEY must be 64 hex characters (32 bytes) for aes-256-gcm, but got ` +
        `${e.ENCRYPTION_KEY.length} character(s). Generate one with: openssl rand -hex 32`,
    );
  }

  if (e.NODE_ENV === "production") {
    if (e.ENCRYPTION_KEY === "0".repeat(64)) {
      errors.push(
        "ENCRYPTION_KEY is still the all-zero development default. Set a real key: openssl rand -hex 32",
      );
    }
    if (e.JWT_SECRET.startsWith("dev-") || e.JWT_REFRESH_SECRET.startsWith("dev-")) {
      warnings.push("JWT_SECRET / JWT_REFRESH_SECRET are still development defaults.");
    }
    if (!e.GOOGLE_CLIENT_ID) {
      warnings.push("GOOGLE_CLIENT_ID is unset — Google sign-in will fail.");
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n  - ${errors.join("\n  - ")}`);
  }

  return warnings;
}
