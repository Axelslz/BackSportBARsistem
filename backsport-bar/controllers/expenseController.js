import Expense from '../models/Expense.js';
     
export const getExpenses = async (req, res) => {
    try {
        const { type } = req.query; 
        
        let whereClause = {};
        if (type) {
            whereClause = { type };
        }

        const expenses = await Expense.findAll({ 
            where: whereClause,
            order: [['date', 'DESC']] 
        });
        
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createExpense = async (req, res) => {
    try {
        const { type, category, description, amount, date } = req.body;
        
        const newExpense = await Expense.create({
            type, 
            category, 
            description, 
            amount, 
            date
        });
        
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        await Expense.destroy({ where: { id } });
        res.json({ message: 'Gasto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};