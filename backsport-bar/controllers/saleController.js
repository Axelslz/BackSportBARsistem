import Sale from '../models/Sale.js';
import SaleItem from '../models/SaleItem.js';
import Product from '../models/Product.js';
import Expense from '../models/Expense.js'; 
import CashSession from '../models/CashSession.js'; 
import sequelize from '../config/db.js';   
import { Op } from 'sequelize'; 

export const createSale = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { cart, total, paymentMethod, seller, customer, ticketNumber, amountPaid, change, tip } = req.body;

        const newSale = await Sale.create({
            total,
            amountPaid: amountPaid !== undefined ? amountPaid : total, 
            change: change !== undefined ? change : 0,                 
            paymentMethod,
            seller,
            ticketNumber: ticketNumber || null,  
            customerName: customer.name,
            customerAddress: customer.address,
            customerPhone: customer.phone,
            tip: tip !== undefined ? tip : 0.00 
        }, { transaction: t });

        for (const item of cart) {

            const realProductId = parseInt(item.id.toString().split('-')[0], 10);

            await SaleItem.create({
                SaleId: newSale.id, 
                ProductId: realProductId,
                productName: item.name,   
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity
            }, { transaction: t });

            const product = await Product.findByPk(realProductId, { transaction: t });
            if (product) {
                const categoryLower = product.category ? product.category.toLowerCase() : '';
                const isFoodOrSnack = categoryLower === 'botanas' || categoryLower === 'alimentos' || categoryLower === 'comida';
                
                if (isFoodOrSnack) {
                    await product.increment('soldCount', { 
                        by: item.quantity, 
                        transaction: t 
                    });
                } else {
                    await product.decrement('stock', { 
                        by: item.quantity, 
                        transaction: t 
                    });
                }
            }
        }

        await t.commit();
        res.status(201).json({ message: 'Venta registrada con éxito', saleId: newSale.id, ticketNumber: newSale.ticketNumber });

    } catch (error) {
        await t.rollback();
        console.error("Error al registrar venta:", error);
        res.status(500).json({ message: 'Error al procesar la venta', error: error.message });
    }
};


export const startCashSession = async (req, res) => {
    try {
        const { initialCash } = req.body;
        
        // Validar si ya hay una caja abierta
        const activeBox = await CashSession.findOne({ where: { status: 'OPEN' } });
        if (activeBox) {
            return res.status(400).json({ message: 'Ya hay una caja activa abierta. Debes cerrarla primero.' });
        }

        const session = await CashSession.create({ initialCash, status: 'OPEN' });
        res.status(201).json({ message: 'Caja inicializada con éxito', session });
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar caja', error: error.message });
    }
};

export const getActiveCashSession = async (req, res) => {
    try {
        const activeBox = await CashSession.findOne({ where: { status: 'OPEN' } });
        if (!activeBox) return res.json(null); // No hay caja iniciada

        // Buscar todas las ventas creadas desde que se abrió la caja actual
        const sales = await Sale.findAll({
            where: { createdAt: { [Op.gte]: activeBox.createdAt } }
        });

        let efectivo = 0;
        let tarjeta = 0;
        let transferencia = 0;
        let totalPropinas = 0;
        let totalConsumo = 0;

        sales.forEach(sale => {
            const saleTotal = parseFloat(sale.total) || 0;
            const saleTip = parseFloat(sale.tip) || 0;
            
            totalConsumo += saleTotal;
            totalPropinas += saleTip;

            const method = sale.paymentMethod ? sale.paymentMethod.toUpperCase() : 'EFECTIVO';
            if (method === 'EFECTIVO' || method === 'EFECTIVO') efectivo += saleTotal;
            else if (method === 'TARJETA') tarjeta += saleTotal;
            else if (method === 'TRANSFERENCIA') transferencia += saleTotal;
        });

        res.json({
            session: activeBox,
            totals: {
                initialCash: parseFloat(activeBox.initialCash),
                efectivo,
                tarjeta,
                transferencia,
                totalPropinas,
                totalConsumo,
                granTotal: efectivo + tarjeta + transferencia,
                efectivoEsperadoEnCaja: parseFloat(activeBox.initialCash) + efectivo 
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos de caja', error: error.message });
    }
};

export const closeCashSession = async (req, res) => {
    try {
        const activeBox = await CashSession.findOne({ where: { status: 'OPEN' } });
        if (!activeBox) return res.status(400).json({ message: 'No hay ninguna caja abierta.' });

        activeBox.status = 'CLOSED';
        activeBox.closedAt = new Date();
        await activeBox.save();

        res.json({ message: 'Caja cerrada correctamente. Corte guardado.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cerrar caja', error: error.message });
    }
};

export const getSalesHistory = async (req, res) => {
    try {
        const sales = await Sale.findAll({
            include: [SaleItem], 
            order: [['createdAt', 'DESC']] 
        });
        res.json(sales);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener historial' });
    }
};

export const markSaleAsPaid = async (req, res) => {
    const { id } = req.params; 
    try {
        const sale = await Sale.findByPk(id);
        if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });

        sale.paymentMethod = 'EFECTIVO';
        await sale.save(); 
        res.json({ message: 'Deuda liquidada correctamente', sale });
    } catch (error) {
        console.error("Error al cobrar deuda:", error);
        res.status(500).json({ message: 'Error al actualizar la venta' });
    }
};

export const resetSystemHistory = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        await SaleItem.destroy({ where: {}, transaction: t });
        await Sale.destroy({ where: {}, transaction: t });
        await Expense.destroy({ where: {}, transaction: t });
        await CashSession.destroy({ where: {}, transaction: t });
        await t.commit();
        res.json({ message: 'Historial eliminado. Sistema en $0.00' });
    } catch (error) {
        await t.rollback();
        console.error("❌ Error CRÍTICO al reiniciar sistema:", error);
        res.status(500).json({ message: 'Error interno al reiniciar el sistema', error: error.message });
    }
};