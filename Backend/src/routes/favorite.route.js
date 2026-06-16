// Wishlist/Favorite endpoint routes definitions
import express from "express";
import { toggleFavorite } from "../controllers/wishlist.controller.js";
import authMiddleware from "../middleware/auth.js";
import {getFavorite} from '../controllers/wishlist.controller.js'

const router = express.Router();

router.post("/:itemId", authMiddleware, toggleFavorite);
router.get('/',authMiddleware,getFavorite);

export default router;
 