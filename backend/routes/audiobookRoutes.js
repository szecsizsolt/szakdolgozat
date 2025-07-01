import express from 'express';
import {
  createAudiobook,
  updateAudiobook,
  getAudiobookById,
  deleteAudiobook,
  getAllAudiobooks
} from '../controllers/audiobookController.js';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/full', authenticate, isAdmin, createAudiobook); 
router.patch('/:id', authenticate, isAdmin, updateAudiobook);
router.get('/:id', getAudiobookById);
router.delete('/:id', authenticate, isAdmin, deleteAudiobook);
router.get('/', getAllAudiobooks);

export default router;
