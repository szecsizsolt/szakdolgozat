import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getCart);
router.post('/', authenticate, addToCart);
router.patch('/:id', authenticate, updateCartItem);
router.delete('/:id', authenticate, deleteCartItem);
router.delete('/', authenticate, clearCart);

export default router;
