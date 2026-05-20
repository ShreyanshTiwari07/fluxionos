import { draftRepository } from "../repositories/draft.repository.js";
import { emailService } from "./email.service.js";
import { AppError } from "../middleware/error-handler.js";
import type { DraftCategory } from "@fluxionos/shared";

export const draftService = {
  async createDraft(
    userId: string,
    data: { to?: string[]; subject?: string; body?: string; category?: DraftCategory },
  ) {
    return draftRepository.create({ user_id: userId, ...data });
  },

  async listDrafts(
    userId: string,
    options: { category?: DraftCategory; page?: number; limit?: number },
  ) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 50);
    const offset = (page - 1) * limit;

    const { drafts, total } = await draftRepository.findByUserId(userId, {
      category: options.category,
      limit,
      offset,
    });

    return {
      drafts,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  },

  async updateDraft(
    userId: string,
    draftId: string,
    data: { to?: string[]; subject?: string; body?: string; category?: DraftCategory },
  ) {
    const draft = await draftRepository.findById(draftId);
    if (!draft || draft.user_id !== userId) {
      throw new AppError(404, "Draft not found");
    }
    return draftRepository.update(draftId, data);
  },

  async deleteDraft(userId: string, draftId: string) {
    const draft = await draftRepository.findById(draftId);
    if (!draft || draft.user_id !== userId) {
      throw new AppError(404, "Draft not found");
    }
    await draftRepository.delete(draftId);
    return { message: "Draft deleted" };
  },

  async scheduleDraft(
    userId: string,
    draftId: string,
    data: {
      scheduled_at: string;
      follow_up?: { delay_hours: number; follow_up_body: string };
    },
  ) {
    const draft = await draftRepository.findById(draftId);
    if (!draft || draft.user_id !== userId) {
      throw new AppError(404, "Draft not found");
    }

    if (!draft.to || draft.to.length === 0) {
      throw new AppError(400, "Draft must have at least one recipient to schedule");
    }
    if (!draft.subject) {
      throw new AppError(400, "Draft must have a subject to schedule");
    }
    if (!draft.body) {
      throw new AppError(400, "Draft must have a body to schedule");
    }

    // Use email service to schedule (handles quota, queueing, etc.)
    const email = await emailService.scheduleEmail(userId, {
      to: draft.to,
      subject: draft.subject,
      body: draft.body,
      scheduled_at: data.scheduled_at,
      follow_up: data.follow_up,
    });

    // Delete the draft after scheduling
    await draftRepository.delete(draftId);

    return email;
  },
};
