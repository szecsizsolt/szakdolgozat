import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart
} from "../controllers/cartController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { ensureUserInDatabase } from "../middleware/ensureUserInDatabase.js";

const router = express.Router();

router.use(authenticate, ensureUserInDatabase);

router.get("/", getCart);
router.post("/", addToCart);
router.patch("/:id", updateCartItem);
router.delete("/:id", deleteCartItem);
router.delete("/", clearCart);

export default router;
