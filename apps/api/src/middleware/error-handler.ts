import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import type { ApiResponse } from "@fluxionos/shared";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: err.message,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  logger.error(err, "Unhandled error");

  const response: ApiResponse = {
    success: false,
    error: "Internal server error",
  };
  res.status(500).json(response);
}
