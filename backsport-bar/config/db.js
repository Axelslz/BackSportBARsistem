import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306, 
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            connectTimeout: 60000 
        }
    }
);

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a MySQL exitosa.');
    } catch (error) {
        console.error('❌ Error de conexión a la BD:', error);
        process.exit(1); 
    }
};

export default sequelize;

