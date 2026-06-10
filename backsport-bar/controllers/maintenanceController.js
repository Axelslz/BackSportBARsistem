import Maintenance from '../models/Maintenance.js';

export const getMaintenanceRecords = async (req, res) => {
    try {
        const records = await Maintenance.findAll({ order: [['date', 'DESC']] });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createMaintenanceRecord = async (req, res) => {
    try {
        const { vehicle, type, description, cost, date, notes, mileage } = req.body;
        
        const newRecord = await Maintenance.create({
            vehicle, type, description, cost, date, notes, mileage
        });
        res.json(newRecord);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteMaintenanceRecord = async (req, res) => {
    try {
        const { id } = req.params;
        await Maintenance.destroy({ where: { id } });
        res.json({ message: 'Registro eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};