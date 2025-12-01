import express from 'express';
import { createProperty, getProperties, updateProperty, deleteProperty } from '../controllers/property.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createProperty).get(protect, getProperties);
router.route('/:id').put(protect, updateProperty).delete(protect, deleteProperty);

export default router;
