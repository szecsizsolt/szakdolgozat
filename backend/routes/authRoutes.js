import express from 'express';
import { registerUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', authenticate, registerUser);

export default router;
