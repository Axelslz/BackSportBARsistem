import express from 'express';
import { 
  createSale, 
  getSalesHistory, 
  markSaleAsPaid, 
  resetSystemHistory,
  startCashSession,       
  getActiveCashSession,   
  closeCashSession        
} from '../controllers/saleController.js';

const router = express.Router();

router.post('/cash/start', startCashSession);
router.get('/cash/active', getActiveCashSession);
router.post('/cash/close', closeCashSession);
router.post('/', createSale);       
router.get('/', getSalesHistory);
router.put('/:id/pay', markSaleAsPaid);
router.delete('/reset-history', resetSystemHistory);

export default router;