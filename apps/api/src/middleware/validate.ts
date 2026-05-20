import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import type { ApiResponse } from "@fluxionos/shared";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const response: ApiResponse = {
          success: false,
          error: "Validation failed",
          message: err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
        };
        res.status(400).json(response);
        return;
      }
      next(err);
    }
  };
}
