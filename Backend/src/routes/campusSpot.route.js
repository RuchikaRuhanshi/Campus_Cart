import { Router } from "express";
import { createSpot, getSpots } from "../controllers/campusSpot.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/all", getSpots);
router.post("/create", verifyToken, createSpot);

export default router;
