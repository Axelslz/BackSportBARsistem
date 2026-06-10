import Product from '../models/Product.js';
import ProductHistory from '../models/ProductHistory.js'; 

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
};

export const createProduct = async (req, res) => {
    try {
        // Agregamos priceHalf
        const { name, barcode, category, stock, cost, priceRetail, priceHalf } = req.body;
        
        const existingProduct = await Product.findOne({
            where: {
                name: name,
                category: category || 'Otros'
            }
        });

        if (existingProduct) {
            const oldStock = parseFloat(existingProduct.stock) || 0;
            const oldCost = parseFloat(existingProduct.cost) || 0;
            const oldPrice = parseFloat(existingProduct.priceRetail) || 0;
            
            const newQty = parseFloat(stock) || 0;
            const newCost = parseFloat(cost) || 0;

            const totalStock = oldStock + newQty;
            let averageCost = oldCost;

            if (totalStock > 0) {
                averageCost = ((oldStock * oldCost) + (newQty * newCost)) / totalStock;
            }

            existingProduct.stock = totalStock;
            existingProduct.cost = averageCost.toFixed(2); 
            existingProduct.priceRetail = priceRetail;
            existingProduct.priceHalf = priceHalf || 0;

            await existingProduct.save(); 
            
            await ProductHistory.create({
                ProductId: existingProduct.id,
                action: 'ACTUALIZACIÓN AUTOMÁTICA',
                oldStock: oldStock,
                newStock: totalStock,
                oldCost: oldCost,
                newCost: averageCost,
                oldPrice: oldPrice,
                newPrice: priceRetail,
                notes: `Se sumaron ${newQty} pzs porque se intentó registrar un producto idéntico.`
            });

            return res.status(200).json(existingProduct); 
        } else {
            const newProduct = await Product.create({
                name, barcode, category, stock, cost, priceRetail, priceHalf: priceHalf || 0
            });
            
            await ProductHistory.create({
                ProductId: newProduct.id,
                action: 'CREACIÓN',
                newStock: newProduct.stock,
                newCost: newProduct.cost,
                newPrice: newProduct.priceRetail,
                notes: 'Producto registrado por primera vez en el sistema.'
            });

            return res.status(201).json(newProduct);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al guardar producto' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const oldStock = product.stock;
        const oldCost = product.cost;
        const oldPrice = product.priceRetail;

        // Actualizamos incluyendo priceHalf
        await product.update({
            name: req.body.name,
            barcode: req.body.barcode,
            category: req.body.category,
            stock: req.body.stock,
            cost: req.body.cost,
            priceRetail: req.body.priceRetail,
            priceHalf: req.body.priceHalf || 0
        });

        await ProductHistory.create({
            ProductId: product.id,
            action: 'EDICIÓN MANUAL',
            oldStock: oldStock,
            newStock: product.stock,
            oldCost: oldCost,
            newCost: product.cost,
            oldPrice: oldPrice,
            newPrice: product.priceRetail,
            notes: 'Se editaron datos del producto desde el panel.'
        });

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar producto' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        await product.destroy();
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar producto' });
    }
};

export const addStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { addedStock, newCost } = req.body;
        
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const oldStock = parseFloat(product.stock) || 0;
        const oldCost = parseFloat(product.cost) || 0;
        const newQty = parseFloat(addedStock) || 0;
        const costOfNew = parseFloat(newCost) || 0;

        const totalStock = oldStock + newQty;
        let averageCost = oldCost;

        if (totalStock > 0) {
            averageCost = ((oldStock * oldCost) + (newQty * costOfNew)) / totalStock;
        }

        await ProductHistory.create({
            ProductId: product.id,
            action: 'INGRESO DE STOCK',
            oldStock: oldStock,
            newStock: totalStock,
            oldCost: oldCost,
            newCost: averageCost,
            oldPrice: product.priceRetail,
            newPrice: product.priceRetail, 
            notes: `Se ingresaron ${newQty} pzs compradas a $${costOfNew.toFixed(2)} c/u.`
        });

        product.stock = totalStock;
        product.cost = averageCost.toFixed(2);
        
        await product.save();
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al agregar stock' });
    }
};

export const getProductHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const history = await ProductHistory.findAll({
            where: { ProductId: id },
            order: [['createdAt', 'DESC']] 
        });
        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener historial' });
    }
};