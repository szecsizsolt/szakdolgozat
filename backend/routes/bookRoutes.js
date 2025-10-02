import express from "express";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} from "../controllers/bookController.js";
import { authenticate, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Összes könyv lekérése
router.get("/", getAllBooks);

// Egy könyv lekérése azonosító alapján
router.get("/:id", getBookById);

// Új könyv létrehozása (csak admin)
router.post("/", authenticate, isAdmin, createBook);

// Könyv frissítése (csak admin)
router.patch("/:id", authenticate, isAdmin, updateBook);

// Könyv törlése (csak admin)
router.delete("/:id", authenticate, isAdmin, deleteBook);

export default router;
