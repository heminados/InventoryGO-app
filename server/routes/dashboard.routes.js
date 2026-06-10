import express from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

// GET /dashboard/stats
router.get('/stats', dashboardController.getStats);

export default router;
