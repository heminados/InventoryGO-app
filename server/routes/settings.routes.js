import express from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(verifyToken);

// GET /settings — any authenticated user (the mobile app reads the flags)
router.get('/', settingsController.getSettings);

// PUT /settings — Admin / Manager only (the Back Office switches)
router.put('/', requireAdmin, settingsController.updateSetting);

export default router;
