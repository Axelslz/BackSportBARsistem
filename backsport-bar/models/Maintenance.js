import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Maintenance = sequelize.define('Maintenance', {
    vehicle: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    type: {
        type: DataTypes.ENUM('servicio', 'refaccion', 'combustible'),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    mileage: {
        type: DataTypes.INTEGER, 
        allowNull: true          
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY, 
        defaultValue: DataTypes.NOW
    },
    notes: {
        type: DataTypes.TEXT, 
        allowNull: true
    }
}, {
    timestamps: true
});

export default Maintenance;