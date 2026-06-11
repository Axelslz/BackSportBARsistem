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
const PORT = process.env.PORT || 10000; // En Render se suele usar el 10000 por defecto

// Middlewares
app.use(cors());
app.use(express.json());

// Relaciones/Asociaciones de la BD
Sale.hasMany(SaleItem, { onDelete: 'CASCADE' });
SaleItem.belongsTo(Sale);

Product.hasMany(SaleItem);
SaleItem.belongsTo(Product);

Product.hasMany(ProductHistory, { onDelete: 'CASCADE' });
ProductHistory.belongsTo(Product);

// Rutas de la API
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/maintenance', maintenanceRoutes); 
app.use('/api/expenses', expenseRoutes); 

// Ruta de salud (Opcional, pero ayuda a Render a saber que el servicio está vivo)
app.get('/health', (req, res) => res.status(200).send('OK'));

// Función asíncrona para inicializar todo en el orden correcto
const startServer = async () => {
    try {
        // 1. Conectar a la base de datos
        await connectDB();

        // 2. Sincronizar las tablas (Crear o alterar tablas en Hostinger si no existen)
        console.log('⏳ Sincronizando tablas con Hostinger...');
        await sequelize.sync({ alter: true });
        console.log('✅ Tablas creadas/actualizadas con éxito en la BD.');

        // 3. Levantar el servidor Express una vez que todo lo anterior sea exitoso
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Error crítico al iniciar el backend:', error);
        process.exit(1); // Detiene el proceso si no hay base de datos
    }
};

// Arrancar nuestra aplicación
startServer();