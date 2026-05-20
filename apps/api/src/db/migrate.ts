import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "migrations");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://sendwise:sendwise@localhost:5432/sendwise",
});

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(): Promise<string[]> {
  const result = await pool.query("SELECT name FROM _migrations ORDER BY id");
  return result.rows.map((r) => r.name);
}

async function migrate() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let count = 0;
  for (const file of files) {
    if (applied.includes(file)) continue;

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    // Extract only the "Up Migration" part (before "-- Down Migration")
    const upSql = sql.split("-- Down Migration")[0];

    console.log(`Applying migration: ${file}`);
    await pool.query(upSql);
    await pool.query("INSERT INTO _migrations (name) VALUES ($1)", [file]);
    count++;
  }

  if (count === 0) {
    console.log("No new migrations to apply.");
  } else {
    console.log(`Applied ${count} migration(s).`);
  }
}

async function rollback() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  if (applied.length === 0) {
    console.log("No migrations to roll back.");
    return;
  }

  const lastMigration = applied[applied.length - 1];
  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, lastMigration), "utf-8");
  const downSection = sql.split("-- Down Migration")[1];

  if (!downSection) {
    console.error(`No down migration found in ${lastMigration}`);
    process.exit(1);
  }

  // Uncomment the down migration SQL
  const downSql = downSection
    .split("\n")
    .map((line) => line.replace(/^-- /, ""))
    .join("\n");

  console.log(`Rolling back: ${lastMigration}`);
  await pool.query(downSql);
  await pool.query("DELETE FROM _migrations WHERE name = $1", [lastMigration]);
  console.log("Rolled back successfully.");
}

const command = process.argv[2];

if (command === "down") {
  rollback()
    .catch(console.error)
    .finally(() => pool.end());
} else {
  migrate()
    .catch(console.error)
    .finally(() => pool.end());
}
