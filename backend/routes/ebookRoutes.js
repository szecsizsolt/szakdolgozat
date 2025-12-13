import express from "express";
import {
  getEbooks,
  getEbookById,
  createEbook,
  deleteEbook,
  updateEbook
} from "../controllers/ebookController.js";
import { authenticate, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getEbooks);
router.get("/:id", getEbookById);

router.post("/full", authenticate, isAdmin, createEbook);
router.patch("/:id", authenticate, isAdmin, updateEbook);
router.delete("/:id", authenticate, isAdmin, deleteEbook);

export default router;
