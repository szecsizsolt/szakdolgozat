import express from "express";
import { placeOrder, getAllOrders } from "../controllers/orderController.js";
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';
import { ensureUserInDatabase } from '../middleware/ensureUserInDatabase.js';

const router = express.Router();

// Autentikáció + biztosítsd, hogy a felhasználó szerepel az adatbázisban
router.post("/orders", authenticate, ensureUserInDatabase, placeOrder);

// Admin route (admin jogosultság ellenőrzéssel)
router.get("/admin/orders", authenticate, ensureUserInDatabase, isAdmin, getAllOrders);

export default router;
