import express from "express";
import { createUrgentRequest, getAllUrgentRequests, resolveUrgentRequest, getHeatmapData } from "../controllers/urgent.controller.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/add", authMiddleware, createUrgentRequest);
router.get("/all", getAllUrgentRequests);
router.put("/:id/resolve", authMiddleware, resolveUrgentRequest);
router.get("/heatmap", getHeatmapData);

export default router;
