import express from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();
// -> auth/login
router.post('/login', authController.login);
// -> auth/register
router.post('/register', authController.register);

export default router;