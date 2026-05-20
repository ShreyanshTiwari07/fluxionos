import type { Request, Response, NextFunction } from "express";
import { draftService } from "../services/draft.service.js";
import type { DraftCategory } from "@fluxionos/shared";

export const draftController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const draft = await draftService.createDraft(req.userId!, req.body);
      res.status(201).json({ success: true, data: draft });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, page, limit } = req.query;
      const result = await draftService.listDrafts(req.userId!, {
        category: category as DraftCategory | undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      res.json({ success: true, data: result.drafts, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const draft = await draftService.updateDraft(req.userId!, req.params.id, req.body);
      res.json({ success: true, data: draft });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await draftService.deleteDraft(req.userId!, req.params.id);
      res.json({ success: true, message: result.message });
    } catch (err) {
      next(err);
    }
  },

  async schedule(req: Request, res: Response, next: NextFunction) {
    try {
      const email = await draftService.scheduleDraft(req.userId!, req.params.id, req.body);
      res.status(201).json({ success: true, data: email });
    } catch (err) {
      next(err);
    }
  },
};
