import { Router } from 'express';
import dashboardController from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/auth.js';
import { permissionGuard } from '../middleware/roleGuard.js';

const router = Router();

// All dashboard routes require authentication and 'read:dashboard' permission
router.use(authMiddleware);
router.use(permissionGuard('read:dashboard'));

// @route   GET /api/dashboard/summary
// @desc    Get dashboard summary totals
// @access  Private
router.get('/summary', dashboardController.getSummary);

// @route   GET /api/dashboard/categories
// @desc    Get expenses and income aggregated by category
// @access  Private
router.get('/categories', dashboardController.getCategoryBreakdown);

// @route   GET /api/dashboard/trends
// @desc    Get monthly income vs expense trends
// @access  Private
router.get('/trends', dashboardController.getMonthlyTrends);

// @route   GET /api/dashboard/health
// @desc    Get calculated financial health score
// @access  Private
router.get('/health', dashboardController.getFinancialHealth);

export default router;
