import { Router } from 'express';
import { getStoreConfig, saveStoreConfig } from '../controllers/storeController.js';

const router = Router();

router.get('/store-config', getStoreConfig);
router.post('/store-config', saveStoreConfig);

export default router;