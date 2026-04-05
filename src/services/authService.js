import jwt from 'jsonwebtoken';
import { User, Role } from '../models/index.js';

const login = async (email, password) => {
  const user = await User.scope('withPassword').findOne({
    where: { email: email.toLowerCase().trim() },
    include: { model: Role },
  });

  if (!user || !user.comparePassword(password)) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    err.isApplicationError = true;
    throw err;
  }

  if (user.status === 'inactive') {
    const err = new Error('Your account has been deactivated. Contact an administrator.');
    err.status = 403;
    err.isApplicationError = true;
    throw err;
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.Role.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '24h' }
  );

  await user.update({ last_login_at: new Date() });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.Role.name,
    },
  };
};

export { login };
