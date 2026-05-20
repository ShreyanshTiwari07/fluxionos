import type { Request, Response, NextFunction } from "express";
import { emailService } from "../services/email.service.js";
import type { EmailStatus } from "@fluxionos/shared";

export const emailController = {
  async schedule(req: Request, res: Response, next: NextFunction) {
    try {
      const email = await emailService.scheduleEmail(req.userId!, req.body);
      res.status(201).json({ success: true, data: email });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;
      const result = await emailService.listEmails(req.userId!, {
        status: status as EmailStatus | undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      res.json({ success: true, data: result.emails, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const email = await emailService.getEmail(req.userId!, req.params.id);
      res.json({ success: true, data: email });
    } catch (err) {
      next(err);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await emailService.cancelEmail(req.userId!, req.params.id);
      res.json({ success: true, message: result.message });
    } catch (err) {
      next(err);
    }
  },

  async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await emailService.getStats(req.userId!);
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  },
};
