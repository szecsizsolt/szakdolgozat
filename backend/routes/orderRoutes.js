import express from "express";
import { placeOrder, getAllOrders } from "../controllers/orderController.js";
import { authenticate, isAdmin } from "../middleware/authMiddleware.js";
import { ensureUserInDatabase } from "../middleware/ensureUserInDatabase.js";

const router = express.Router();

router.post("/", authenticate, ensureUserInDatabase, placeOrder);

router.get("/admin/orders", authenticate, ensureUserInDatabase, isAdmin, getAllOrders);

export default router;
