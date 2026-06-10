import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const SaleItem = sequelize.define('SaleItem', {
    productName: { 
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    timestamps: false
});

export default SaleItem;