import { Router } from "express";
import authRoutes from "./auth.routes.js";
import emailRoutes from "./email.routes.js";
import followUpRoutes from "./follow-up.routes.js";
import draftRoutes from "./draft.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/emails", emailRoutes);
router.use("/follow-ups", followUpRoutes);
router.use("/drafts", draftRoutes);

export default router;
