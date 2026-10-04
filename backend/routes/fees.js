import { Router } from 'express';
import { getTransportFees } from '../controllers/feeController.js';

const router = Router();
router.get('/', getTransportFees);
export default router;
