import express from "express";
import { getUserPurchases } from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Bejelentkezett felhasználó vásárlásai
router.get("/purchases", authenticate, getUserPurchases);

export default router;
