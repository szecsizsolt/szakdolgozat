import express from 'express';
import {
  getEbooks,
  createEbook,
  deleteEbook,
  updateEbook 
} from '../controllers/ebookController.js';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// E-könyvek lekérése
router.get('/', getEbooks);

// Új e-könyv létrehozása (csak admin)
router.post('/full', authenticate, isAdmin, createEbook);

// E-könyv törlése (csak admin)
router.delete('/:id', authenticate, isAdmin, deleteEbook);

// E-könyv frissítése (csak admin)
router.patch('/:id', authenticate, isAdmin, updateEbook); 

export default router;
