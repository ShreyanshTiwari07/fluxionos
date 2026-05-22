import type { Request, Response, NextFunction } from "express";
import { geminiService, GeminiError } from "../services/gemini.service.js";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../middleware/error-handler.js";

export const aiController = {
  /** Generates a preview follow-up body from an original email's subject + body. */
  async followUpPreview(req: Request, res: Response, next: NextFunction) {
    try {
      if (!geminiService.isConfigured()) {
        throw new AppError(503, "AI follow-ups are not available (Gemini is not configured)");
      }

      const { subject, body } = req.body as { subject: string; body: string };
      const user = await userRepository.findById(req.userId!);

      const followUpBody = await geminiService.generateFollowUpBody({
        subject,
        body,
        senderName: user?.name ?? null,
      });

      res.json({ success: true, data: { follow_up_body: followUpBody } });
    } catch (err) {
      if (err instanceof AppError) return next(err);
      // Map Gemini rate limits to 429; other generation failures to 502.
      if (err instanceof GeminiError) {
        return next(new AppError(err.status === 429 ? 429 : 502, err.message));
      }
      next(new AppError(502, err instanceof Error ? err.message : "AI generation failed"));
    }
  },
};
