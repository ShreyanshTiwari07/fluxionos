import "dotenv/config";
import { startWorkers } from "./start.js";

// Standalone worker process (used in local dev via `pnpm dev:workers`).
startWorkers();
