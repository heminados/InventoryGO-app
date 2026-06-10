import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.post('/', userController.addUser);
router.put('/:id', userController.editUser);
router.delete('/:id', userController.removeUser);
router.post('/:id/reset-password', userController.resetPassword);

export default router;
