import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { where } from 'sequelize';

export const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      username,
      password: hashedPassword,
      role: role || 'empleado' 
    });

    res.status(201).json({ message: `Usuario ${role || 'empleado'} creado con éxito` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }

};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET || 'cazadoressport2026',
      { expiresIn: '12h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ 
      attributes: { exclude: ['password'] } 
    });
    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: 'Error al obtener la lista de usuarios' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (username) user.username = username;
    if (role) user.role = role;
  
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    
    res.json({ 
      message: 'Usuario actualizado correctamente', 
      user: { id: user.id, username: user.username, role: user.role } 
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.destroy();
    res.json({ message: 'Usuario eliminado del sistema' });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
};
