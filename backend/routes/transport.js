import { Router } from 'express';
import { getTransport } from '../controllers/transportController.js';

const router = Router();
router.get('/', getTransport);
export default router;
