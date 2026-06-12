import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const CashSession = sequelize.define('CashSession', {
    initialCash: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00 
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'OPEN' 
    },
    closedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true 
});

export default CashSession;