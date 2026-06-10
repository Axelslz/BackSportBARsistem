import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ProductHistory = sequelize.define('ProductHistory', {
    action: { 
        type: DataTypes.STRING,
        allowNull: false
    },
    oldStock: { 
        type: DataTypes.DECIMAL(10, 2), 
        defaultValue: 0 
    },
    newStock: { 
        type: DataTypes.DECIMAL(10, 2), 
        defaultValue: 0 
    },
    oldCost: { 
        type: DataTypes.DECIMAL(10, 2), 
        defaultValue: 0 
    },
    newCost: { 
        type: DataTypes.DECIMAL(10, 2), 
        defaultValue: 0 
    },
    oldPrice: { 
        type: DataTypes.DECIMAL(10, 2), 
        defaultValue: 0 
    },
    newPrice: { 
        type: DataTypes.DECIMAL(10, 2), 
        defaultValue: 0 
    },
    notes: { 
        type: DataTypes.STRING, 
        allowNull: true 
    }
}, {
    timestamps: true 
});

export default ProductHistory;