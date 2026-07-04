// Image asset uploading routes
import express from 'express';
import { uploadImages } from '../controllers/upload.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Upload route - requires authentication
router.post('/', authMiddleware, uploadImages);

// Public upload route - for profile picture uploads during registration
router.post('/public', uploadImages);

export default router;
 