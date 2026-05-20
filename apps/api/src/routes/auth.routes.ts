import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Public routes
router.get("/google", authController.googleRedirect);
router.get("/google/callback", authController.googleCallback);
router.post("/refresh", authController.refresh);

// Protected routes
router.get("/me", requireAuth, authController.me);
router.post("/logout", requireAuth, authController.logout);

export default router;
