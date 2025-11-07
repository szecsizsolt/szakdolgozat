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
import { optionalAuthenticate, authenticate, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ⚡ FONTOS: mindig a speciális route-ok legyenek elöl!
router.get("/recommended", optionalAuthenticate, getRecommendedBooks);

// 🔍 Keresés
router.get("/search", searchBooks);

// 📚 Összes könyv
router.get("/", getAllBooks);

// 📘 Egy könyv ID alapján
router.get("/:id", getBookById);

// 🔐 Admin műveletek
router.post("/", authenticate, isAdmin, createBook);
router.patch("/:id", authenticate, isAdmin, updateBook);
router.delete("/:id", authenticate, isAdmin, deleteBook);

export default router;
