import express from "express";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getRecommendedBooks
} from "../controllers/bookController.js";
import { optionalAuthenticate, authenticate, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// FONTOS: a specifikus útvonalak menjenek a dinamikus (:id) ELÉ
router.get("/recommended", optionalAuthenticate, getRecommendedBooks);

// Összes könyv
router.get("/", getAllBooks);

// Egy könyv ID-ra
router.get("/:id", getBookById);

// Adminos műveletek
router.post("/", authenticate, isAdmin, createBook);
router.patch("/:id", authenticate, isAdmin, updateBook);
router.delete("/:id", authenticate, isAdmin, deleteBook);

export default router;
