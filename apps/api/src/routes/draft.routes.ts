import { Router } from "express";
import { draftController } from "../controllers/draft.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createDraftSchema, updateDraftSchema } from "@fluxionos/shared";

const router = Router();

router.use(requireAuth);

router.post("/", validate(createDraftSchema), draftController.create);
router.get("/", draftController.list);
router.patch("/:id", validate(updateDraftSchema), draftController.update);
router.delete("/:id", draftController.remove);
router.post("/:id/schedule", draftController.schedule);

export default router;
