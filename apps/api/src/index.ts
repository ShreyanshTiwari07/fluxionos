import app from "./app.js";
import { env, validateEnv } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { startWorkers } from "./workers/start.js";

// Refuse to boot on config that would only fail later, mid-request.
try {
  for (const warning of validateEnv()) {
    logger.warn(warning);
  }
} catch (err) {
  logger.error((err as Error).message);
  process.exit(1);
}

app.listen(env.API_PORT, () => {
  logger.info(`FluxionOS API running on port ${env.API_PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});

// On single-service (free) deploys the API also hosts the background workers.
if (env.RUN_WORKERS) {
  startWorkers();
}
