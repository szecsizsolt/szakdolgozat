import express from 'express';
import {
  createOrder,
  getOrders
} from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkout', authenticate, createOrder);
router.get('/', authenticate, getOrders);

export default router;
