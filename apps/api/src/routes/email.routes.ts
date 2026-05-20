import { Router } from "express";
import { emailController } from "../controllers/email.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { scheduleEmailSchema } from "@fluxionos/shared";

const router = Router();

router.use(requireAuth);

router.post("/schedule", validate(scheduleEmailSchema), emailController.schedule);
router.get("/", emailController.list);
router.get("/stats", emailController.stats);
router.get("/:id", emailController.getOne);
router.patch("/:id/cancel", emailController.cancel);

export default router;
