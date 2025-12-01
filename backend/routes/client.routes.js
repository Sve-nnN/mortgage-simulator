import express from 'express';
import { createClient, getClients, updateClient, deleteClient } from '../controllers/client.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createClient).get(protect, getClients);
router.route('/:id').put(protect, updateClient).delete(protect, deleteClient);

export default router;
