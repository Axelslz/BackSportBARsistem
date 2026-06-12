import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize, { connectDB } from './config/db.js';

// Modelos (Importantes para que Sequelize los reconozca al sincronizar)
import Product from './models/Product.js';
import Sale from './models/Sale.js';
import SaleItem from './models/SaleItem.js';
import StoreConfig from './models/StoreConfig.js';
import User from './models/User.js';
import Maintenance from './models/Maintenance.js'; 
import Expense from './models/Expense.js'; 
import ProductHistory from './models/ProductHistory.js';

// Rutas
import productRoutes from './routes/productRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import authRoutes from './routes/authRoutes.js'; 
import maintenanceRoutes from './routes/maintenanceRoutes.js'; 
import expenseRoutes from './routes/expenseRoutes.js'; 

dotenv.config();           

const app = express();
const PORT = process.env.PORT || 10000; 

app.use(cors());
app.use(express.json());

Sale.hasMany(SaleItem, { onDelete: 'CASCADE' });
SaleItem.belongsTo(Sale);

Product.hasMany(SaleItem);
SaleItem.belongsTo(Product);

Product.hasMany(ProductHistory, { onDelete: 'CASCADE' });
ProductHistory.belongsTo(Product);

app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/maintenance', maintenanceRoutes); 
app.use('/api/expenses', expenseRoutes); 

app.get('/health', (req, res) => res.status(200).send('OK'));

const startServer = async () => {
    try {
        
        await connectDB();

        console.log('⏳ Sincronizando tablas con Hostinger...');
        await sequelize.sync({ alter: true });
        console.log('✅ Tablas creadas/actualizadas con éxito en la BD.');

        try {
            await sequelize.query("ALTER TABLE Sales AUTO_INCREMENT = 10000;");
            console.log('🔢 Contador de folios inicializado con éxito en 10000.');
        } catch (dbError) {
            
            console.log('ℹ️ Nota sobre Folio:', dbError.message);
        }

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
        });

    } catch (error) {
        console.error('❌ Error crítico al iniciar el backend:', error);
        process.exit(1); 
    }
};

startServer();