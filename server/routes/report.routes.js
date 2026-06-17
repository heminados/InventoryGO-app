import express from 'express';
import * as reportController from '../controllers/report.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(verifyToken);

// -> reports  (audit list — admins/managers only, read-only)
router.get('/', requireAdmin, reportController.getAllReports);

export default router;
