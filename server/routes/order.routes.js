import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(verifyToken);

// Mobile app routes — any authenticated user
router.post('/create', orderController.createOrder);
router.get('/pending', orderController.getPendingOrders);

// Admin / Manager only — named paths must come before /:id to avoid route conflicts
router.get('/', requireAdmin, orderController.getAllOrders);
router.patch('/:id/approve', requireAdmin, orderController.approveOrder);
router.patch('/:id/cancel', requireAdmin, orderController.cancelOrder);
router.put('/:id', requireAdmin, orderController.updateOrder);

export default router;
