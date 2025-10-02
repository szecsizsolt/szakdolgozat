import express from "express";
import {
  createAudiobook,
  updateAudiobook,
  getAudiobookById,
  deleteAudiobook,
  getAllAudiobooks,
} from "../controllers/audiobookController.js";
import { authenticate, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Publikus végpontok
router.get("/", getAllAudiobooks);
router.get("/:id", getAudiobookById);

// Admin-only végpontok
router.post("/full", authenticate, isAdmin, createAudiobook);
router.patch("/:id", authenticate, isAdmin, updateAudiobook);
router.delete("/:id", authenticate, isAdmin, deleteAudiobook);

export default router;
