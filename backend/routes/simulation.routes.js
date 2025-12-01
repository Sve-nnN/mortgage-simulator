import express from 'express';
import { calculateSimulation, saveSimulation, getSimulationById } from '../controllers/simulation.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/calculate', protect, calculateSimulation);
router.post('/save', protect, saveSimulation);
router.get('/:id', protect, getSimulationById);

export default router;
