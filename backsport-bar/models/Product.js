import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    barcode: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '' 
    },
    category: { 
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Otros'
    },
    stock: {
        type: DataTypes.DECIMAL(10, 2), 
        defaultValue: 0
    },
    cost: { 
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    priceRetail: { 
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    priceHalf: { 
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    soldCount: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: true 
});

export default Product;