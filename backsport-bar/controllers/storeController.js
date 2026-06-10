import StoreConfig from '../models/StoreConfig.js';

export const getStoreConfig = async (req, res) => {
    try {
        const config = await StoreConfig.findOne();
        
        if (!config) {
            return res.json(null);
        }
        
        res.json(config);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener datos de la tienda', error: error.message });
    }
};

export const saveStoreConfig = async (req, res) => {
    const { storeName, slogan, address, phone, email, footerMessage } = req.body;

    try {
        const existingConfig = await StoreConfig.findOne();

        if (existingConfig) {
            await existingConfig.update({
                storeName,
                slogan,
                address,
                phone,
                email,
                footerMessage
            });
            return res.json(existingConfig);
        } else {
            const newConfig = await StoreConfig.create({
                storeName,
                slogan,
                address,
                phone,
                email,
                footerMessage
            });
            return res.json(newConfig);
        }

    } catch (error) {
        return res.status(500).json({ message: 'Error al guardar configuración', error: error.message });
    }
};