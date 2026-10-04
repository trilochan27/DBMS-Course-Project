import { Router } from 'express';
import { getRoutes, getBusCapacity } from '../controllers/routeController.js';

const router = Router();
router.get('/', getRoutes);
router.get('/capacity', getBusCapacity);
export default router;
