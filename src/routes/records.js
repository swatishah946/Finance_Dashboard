import { Router } from 'express';
import recordController from '../controllers/recordController.js';
import validate from '../middleware/validate.js';
import { financialRecordSchema, updateFinancialRecordSchema } from '../validators/schemas.js';
import authMiddleware from '../middleware/auth.js';
import { permissionGuard } from '../middleware/roleGuard.js';

const router = Router();

// All record routes require authentication
router.use(authMiddleware);

// @route   POST /api/records
// @desc    Create a new financial record
// @access  Private (Requires 'create:records' permission)
router.post(
  '/',
  permissionGuard('create:records'),
  validate(financialRecordSchema),
  recordController.create
);

// @route   GET /api/records
// @desc    Get all records (filtered by user if not admin)
// @access  Private (Requires 'read:records' permission)
router.get(
  '/',
  permissionGuard('read:records'),
  recordController.getAll
);

// @route   GET /api/records/:id
// @desc    Get a single record by ID
// @access  Private (Requires 'read:records' permission, plus ownership logic in service)
router.get(
  '/:id',
  permissionGuard('read:records'),
  recordController.getById
);

// @route   PUT /api/records/:id
// @desc    Update a financial record
// @access  Private (Requires 'update:records' or 'update:own_records' permission)
router.put(
  '/:id',
  validate(updateFinancialRecordSchema),
  recordController.update
);

// @route   DELETE /api/records/:id
// @desc    Delete a financial record
// @access  Private (Requires 'delete:records' permission)
router.delete(
  '/:id',
  permissionGuard('delete:records'),
  recordController.destroy
);

export default router;
