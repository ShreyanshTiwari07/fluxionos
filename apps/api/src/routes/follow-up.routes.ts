import { Router } from "express";
import { followUpController } from "../controllers/follow-up.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createFollowUpSchema } from "@fluxionos/shared";

const router = Router();

router.use(requireAuth);

router.post("/", validate(createFollowUpSchema), followUpController.create);
router.get("/", followUpController.list);
router.patch("/:id/cancel", followUpController.cancel);

export default router;
