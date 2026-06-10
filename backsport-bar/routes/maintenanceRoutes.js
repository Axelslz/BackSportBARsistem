import express from 'express';
import { getMaintenanceRecords, createMaintenanceRecord, deleteMaintenanceRecord } from '../controllers/maintenanceController.js';

const router = express.Router();

router.get('/', getMaintenanceRecords);
router.post('/', createMaintenanceRecord);
router.delete('/:id', deleteMaintenanceRecord);

export default router;