import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const StoreConfig = sequelize.define('StoreConfig', {
    storeName: {
        type: DataTypes.STRING,
        defaultValue: 'LA BODEGA' 
    },
    slogan: {
        type: DataTypes.STRING
    },
    address: {
        type: DataTypes.TEXT 
    },
    phone: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    footerMessage: {
        type: DataTypes.TEXT 
    }
}, {
    timestamps: true
});

export default StoreConfig;