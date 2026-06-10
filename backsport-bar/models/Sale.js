import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Sale = sequelize.define('Sale', {
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    amountPaid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    change: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    paymentMethod: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    seller: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ticketNumber: {
        type: DataTypes.STRING,
        allowNull: true, 
        defaultValue: null
    },
    customerName: {
        type: DataTypes.STRING,
        defaultValue: 'PÚBLICO EN GENERAL'
    },
    customerAddress: {
        type: DataTypes.STRING
    },
    customerPhone: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true 
});

export default Sale;