  import jwt from 'jsonwebtoken';

  export const protect = (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        return next(); 
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          console.warn('⚠️ Advertencia: Un token ha expirado. El usuario debe iniciar sesión de nuevo.');
          return res.status(401).json({ message: 'El token ha expirado. Por favor, inicia sesión nuevamente.' });
        } else {
          console.error('🔴 Error verificando el token:', error.message);
          return res.status(401).json({ message: 'No autorizado, token inválido' });
        }
      }
    }

    if (!token) {
      return res.status(401).json({ message: 'No autorizado, no hay token' });
    }
  };

  export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      return next();
    } else {
      return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
  };