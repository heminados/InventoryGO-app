import express from 'express';
import * as taskController from '../controllers/task.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(verifyToken);

// Employee routes — any authenticated user
router.get('/my', taskController.getMyTasks);
router.patch('/:id/complete', taskController.completeTask);

// Admin / Manager only
router.get('/', requireAdmin, taskController.getAllTasks);
router.post('/', requireAdmin, taskController.createTask);
router.put('/:id', requireAdmin, taskController.updateTask);
router.patch('/:id/cancel', requireAdmin, taskController.cancelTask);

export default router;
