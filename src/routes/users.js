import { Router } from 'express';
import userController from '../controllers/userController.js';
import validate from '../middleware/validate.js';
import { changePasswordSchema, createUserSchema, userStatusSchema } from '../validators/schemas.js';
import authMiddleware from '../middleware/auth.js';
import { permissionGuard } from '../middleware/roleGuard.js';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

// @route   PUT /api/users/password
// @desc    Change logged-in user's password
// @access  Private (Any authenticated user)
router.put('/password', validate(changePasswordSchema), userController.changePassword);

// @route   PUT /api/users/:id/status
// @desc    Change user status (active, inactive, suspended)
// @access  Private (Requires 'manage:users' permission - Admin only)
router.put('/:id/status', permissionGuard('manage:users'), validate(userStatusSchema), userController.updateStatus);

// @route   POST /api/users
// @desc    Create a new user
// @access  Private (Requires 'manage:users' permission - Admin only)
router.post('/', permissionGuard('manage:users'), validate(createUserSchema), userController.createUser);

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Requires 'manage:users' permission - Admin only)
router.get('/', permissionGuard('manage:users'), userController.getAllUsers);

export default router;
