import express from 'express';
import {
  getEbooks,
  createEbook,
  deleteEbook,
  updateEbook 
} from '../controllers/ebookController.js';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getEbooks);
router.post('/full', authenticate, isAdmin, createEbook);
router.delete('/:id', authenticate, isAdmin, deleteEbook);
router.patch('/:id', authenticate, isAdmin, updateEbook); 

export default router;
