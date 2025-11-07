import express from "express";
import { authenticate, isAdmin } from "../middleware/authMiddleware.js";
import {
  listBooksForDiscountManager,
  listDiscounts,
  createPercentageDiscount,
  updateDiscount,
  deleteDiscount,
  assignDiscountToBooks,
  unassignDiscountFromBooks,
  getDiscountByBookPublic
} from "../controllers/discountController.js";

const router = express.Router();

// ✅ Nyilvános: akció lekérdezés egy adott könyvhöz
router.get("/book/:bookId", getDiscountByBookPublic);

// 🔒 Minden más admin joghoz kötött
router.use(authenticate, isAdmin);

// Akciókezelő admin route-ok
router.get("/books", listBooksForDiscountManager);
router.get("/", listDiscounts);
router.post("/", createPercentageDiscount);
router.patch("/:id", updateDiscount);
router.delete("/:id", deleteDiscount);
router.post("/:id/assign", assignDiscountToBooks);
router.delete("/:id/unassign", unassignDiscountFromBooks);

export default router;
