import express from "express";
import { getAllPosts, getPostById, createPost, deletePost } from "../controllers/blogController.js";
import { authenticate, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.post("/", authenticate, isAdmin, createPost);
router.delete("/:id", authenticate, isAdmin, deletePost);

export default router;
