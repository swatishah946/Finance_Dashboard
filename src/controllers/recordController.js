import recordService from '../services/recordService.js';

class RecordController {
  async create(req, res, next) {
    try {
      const record = await recordService.createRecord(
        req.validatedBody,
        req.user.id,
        req.user.role
      );

      res.status(201).json({
        success: true,
        message: 'Record created successfully',
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await recordService.getRecords(
        req.user.id,
        req.user.role,
        req.query
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const record = await recordService.getRecordById(id, req.user.id, req.user.role);

      res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const record = await recordService.updateRecord(
        id,
        req.validatedBody,
        req.user.id,
        req.user.role
      );

      res.status(200).json({
        success: true,
        message: 'Record updated successfully',
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      await recordService.deleteRecord(id, req.user.id, req.user.role);

      res.status(200).json({
        success: true,
        message: 'Record deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new RecordController();
