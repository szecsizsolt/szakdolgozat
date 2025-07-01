import express from 'express';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} from '../controllers/bookController.js';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/', authenticate, isAdmin, createBook);
router.patch('/:id', authenticate, isAdmin, updateBook);
router.delete('/:id', authenticate, isAdmin, deleteBook);

export default router;
