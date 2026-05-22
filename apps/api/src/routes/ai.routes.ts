import { Router } from "express";
import { aiController } from "../controllers/ai.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { aiFollowUpPreviewSchema } from "@fluxionos/shared";

const router = Router();

router.use(requireAuth);

router.post("/follow-up-preview", validate(aiFollowUpPreviewSchema), aiController.followUpPreview);

export default router;
