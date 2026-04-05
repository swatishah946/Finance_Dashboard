import { Op } from 'sequelize';
import { FinancialRecord, User } from '../models/index.js';

class RecordService {
  async createRecord(data, userId, userRole) {
    if (userRole === 'viewer') {
      const err = new Error('Viewers cannot create records');
      err.status = 403;
      err.isApplicationError = true;
      throw err;
    }

    const payload = { ...data, user_id: userId };
    const record = await FinancialRecord.create(payload);
    return record;
  }

  async getRecords(userId, userRole, queryParams = {}) {
    const { type, category, startDate, endDate, limit = 50, offset = 0 } = queryParams;

    const where = {};

    if (userRole !== 'admin') {
      where.user_id = userId;
    }

    if (type) where.type = type;

    if (category) {
      where.category = { [Op.like]: `%${category}%` };
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }

    const parsedLimit = Math.min(parseInt(limit, 10) || 50, 1000);
    const parsedOffset = parseInt(offset, 10) || 0;

    const { count, rows } = await FinancialRecord.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['date', 'DESC'], ['id', 'DESC']],
      limit: parsedLimit,
      offset: parsedOffset,
    });

    return {
      data: rows,
      pagination: {
        total: count,
        limit: parsedLimit,
        offset: parsedOffset,
        pages: Math.ceil(count / parsedLimit),
      },
    };
  }

  async getRecordById(id, userId, userRole) {
    const record = await FinancialRecord.findByPk(id, {
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
    });

    if (!record) {
      const err = new Error('Record not found');
      err.status = 404;
      err.isApplicationError = true;
      throw err;
    }

    if (userRole !== 'admin' && record.user_id !== userId) {
      const err = new Error('Access denied. You do not own this record.');
      err.status = 403;
      err.isApplicationError = true;
      throw err;
    }

    return record;
  }

  async updateRecord(id, data, userId, userRole) {
    const record = await this.getRecordById(id, userId, userRole);

    if (userRole === 'viewer') {
      const err = new Error('Viewers cannot update records');
      err.status = 403;
      err.isApplicationError = true;
      throw err;
    }

    if (data.user_id && data.user_id !== record.user_id) {
       const err = new Error('Cannot change record ownership');
       err.status = 400;
       err.isApplicationError = true;
       throw err;
    }

    await record.update(data);
    return record;
  }

  async deleteRecord(id, userId, userRole) {
    if (userRole !== 'admin') {
      const err = new Error('Only administrators can delete records');
      err.status = 403;
      err.isApplicationError = true;
      throw err;
    }

    const record = await FinancialRecord.findByPk(id);
    if (!record) {
      const err = new Error('Record not found');
      err.status = 404;
      err.isApplicationError = true;
      throw err;
    }

    await record.destroy();
  }
}

export default new RecordService();
