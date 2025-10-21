import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getReviewsByBook,
  addReview,
  deleteReview,
} from "../controllers/reviewsController.js";

const router = express.Router();

// Könyv véleményeinek lekérése
router.get("/:bookId", getReviewsByBook);

// Vélemény hozzáadása (bejelentkezve)
router.post("/:bookId", authenticate, addReview);

// Vélemény törlése (csak saját)
router.delete("/:id", authenticate, deleteReview);

export default router;
