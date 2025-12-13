import express from "express";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getRecommendedBooks,
  searchBooks
} from "../controllers/bookController.js";
import {
  optionalAuthenticate,
  authenticate,
  isAdmin
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/recommended", optionalAuthenticate, getRecommendedBooks);

router.get("/search", searchBooks);
router.get("/", getAllBooks);
router.get("/:id", getBookById);

router.post("/", authenticate, isAdmin, createBook);
router.patch("/:id", authenticate, isAdmin, updateBook);
router.delete("/:id", authenticate, isAdmin, deleteBook);

export default router;
