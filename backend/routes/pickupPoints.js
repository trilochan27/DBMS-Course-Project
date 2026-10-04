import { Router } from 'express';
import { getPickupDropPoints } from '../controllers/pickupPointController.js';

const router = Router();
router.get('/', getPickupDropPoints);
export default router;
