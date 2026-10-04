import { Router } from 'express';
import { getPickupRecords } from '../controllers/pickupRecordController.js';

const router = Router();
router.get('/', getPickupRecords);
export default router;
