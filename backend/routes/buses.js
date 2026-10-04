import { Router } from 'express';
import { getBuses } from '../controllers/busController.js';

const router = Router();
router.get('/', getBuses);
export default router;
