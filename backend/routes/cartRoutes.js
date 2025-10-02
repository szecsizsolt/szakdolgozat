import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart
} from '../controllers/cartController.js';

import { authenticate } from '../middleware/authMiddleware.js';
import { ensureUserInDatabase } from '../middleware/ensureUserInDatabase.js';

const router = express.Router();

// Minden kosárhoz kapcsolódó művelethez kell autentikáció és a felhasználó adatbázisban léte
router.use(authenticate, ensureUserInDatabase);

// Kosár lekérése
router.get('/', getCart);

// Új elem hozzáadása a kosárhoz
router.post('/', addToCart);

// Egy kosár elem frissítése (pl. mennyiség)
router.patch('/:id', updateCartItem);

// Egy kosár elem törlése
router.delete('/:id', deleteCartItem);

// Teljes kosár ürítése
router.delete('/', clearCart);

export default router;
