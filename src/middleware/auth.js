import jwt from 'jsonwebtoken';
import { User, Role } from '../models/index.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided',
      });
    }

    const token = authHeader.slice(7);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Token has expired. Please log in again.',
        });
      }
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }

    const user = await User.scope('withPassword').findByPk(decoded.userId, {
      include: { model: Role },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Account not found',
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Your account has been deactivated. Contact an administrator.',
      });
    }

    const permissions = user.Role ? user.Role.permissions : [];

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.Role ? user.Role.name : null,
      permissions: Array.isArray(permissions) ? permissions : [],
    };

    next();
  } catch (err) {
    console.error('[AUTH]', err.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication check failed',
    });
  }
};

export default authMiddleware;
