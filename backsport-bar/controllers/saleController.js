import Sale from '../models/Sale.js';
import SaleItem from '../models/SaleItem.js';
import Product from '../models/Product.js';
import Expense from '../models/Expense.js'; 
import sequelize from '../config/db.js';   

export const createSale = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        // NUEVO: Agregamos amountPaid y change al destructuring del body
        const { cart, total, paymentMethod, seller, customer, ticketNumber, amountPaid, change } = req.body;

        const newSale = await Sale.create({
            total,
            amountPaid: amountPaid !== undefined ? amountPaid : total, // NUEVO
            change: change !== undefined ? change : 0,                 // NUEVO
            paymentMethod,
            seller,
            ticketNumber: ticketNumber || null,  
            customerName: customer.name,
            customerAddress: customer.address,
            customerPhone: customer.phone
        }, { transaction: t });

        for (const item of cart) {
            await SaleItem.create({
                SaleId: newSale.id, 
                ProductId: item.id, 
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity
            }, { transaction: t });

            const product = await Product.findByPk(item.id, { transaction: t });
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

        if (!sale) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

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
        console.log("🔄 Iniciando limpieza de sistema...");
        await SaleItem.destroy({ where: {}, transaction: t });
        await Sale.destroy({ where: {}, transaction: t });
        await Expense.destroy({ where: {}, transaction: t });
        await t.commit();
        console.log("✅ Sistema reiniciado correctamente.");
        
        res.json({ message: 'Historial eliminado. Sistema en $0.00' });

    } catch (error) {
        await t.rollback();
        console.error("❌ Error CRÍTICO al reiniciar sistema:", error);
        res.status(500).json({ 
            message: 'Error interno al reiniciar el sistema', 
            error: error.message 
        });
    }
};