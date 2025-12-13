import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getReviewsByBook,
  addReview,
  deleteReview
} from "../controllers/reviewsController.js";

const router = express.Router();

router.get("/:bookId", getReviewsByBook);
router.post("/:bookId", authenticate, addReview);
router.delete("/:id", authenticate, deleteReview);

export default router;
