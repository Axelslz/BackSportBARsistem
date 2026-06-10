import express from 'express';
import { createSale, getSalesHistory, markSaleAsPaid, resetSystemHistory } from '../controllers/saleController.js';

const router = express.Router();

router.post('/', createSale);       
router.get('/', getSalesHistory);
router.put('/:id/pay', markSaleAsPaid);
router.delete('/reset-history', resetSystemHistory);

export default router;