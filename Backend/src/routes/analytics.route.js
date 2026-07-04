import express from "express";
import { getPublicStats, getLeaderboard, predictItemDemand, aiCopilotChat } from "../controllers/analytics.controller.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/stats", getPublicStats);
router.get("/leaderboard", getLeaderboard);

// AI assistance/prediction routes (requires authentication)
router.post("/predict", authMiddleware, predictItemDemand);
router.post("/chat", authMiddleware, aiCopilotChat);

export default router;
