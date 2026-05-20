import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { apiLimiter } from "./middleware/rate-limiter.js";
import routes from "./routes/index.js";

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: env.WEB_URL,
    credentials: true,
  }),
);

// Parsing
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Rate limiting
app.use("/api", apiLimiter);

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

export default app;
