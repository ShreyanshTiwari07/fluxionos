import pg from "pg";
import { env } from "./env.js";

// Managed Postgres (Neon, Render, etc.) requires TLS. Their certs are valid,
// but we skip strict CA verification to avoid bundling provider root certs.
const useSsl =
  env.NODE_ENV === "production" || /sslmode=require/.test(env.DATABASE_URL);

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
});

export const db = {
  query: (text: string, params?: unknown[]) => pool.query(text, params),
  pool,
};
