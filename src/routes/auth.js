import { Router } from 'express';
import authController from '../controllers/authController.js';
import validate from '../middleware/validate.js';
import { loginSchema } from '../validators/schemas.js';
import authMiddleware from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginLimiter, validate(loginSchema), authController.login);

// @route   GET /api/auth/profile
// @desc    Get currently logged in user profile
// @access  Private
router.get('/profile', authMiddleware, authController.getProfile);

export default router;
