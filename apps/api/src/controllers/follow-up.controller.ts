import type { Request, Response, NextFunction } from "express";
import { followUpService } from "../services/follow-up.service.js";
import type { FollowUpStatus } from "@fluxionos/shared";

export const followUpController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const followUp = await followUpService.createFollowUp(req.userId!, req.body);
      res.status(201).json({ success: true, data: followUp });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;
      const result = await followUpService.listFollowUps(req.userId!, {
        status: status as FollowUpStatus | undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      res.json({ success: true, data: result.followUps, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await followUpService.cancelFollowUp(req.userId!, req.params.id);
      res.json({ success: true, message: result.message });
    } catch (err) {
      next(err);
    }
  },
};
