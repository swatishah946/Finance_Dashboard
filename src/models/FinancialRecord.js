import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const FinancialRecord = sequelize.define('FinancialRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: { msg: 'Amount must be a valid number' },
      min: { args: [0.01], msg: 'Amount must be greater than zero' },
    },
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false,
    validate: {
      isIn: { args: [['income', 'expense']], msg: 'Type must be income or expense' },
    },
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: { args: [2, 100], msg: 'Category must be between 2 and 100 characters' },
      notEmpty: { msg: 'Category cannot be blank' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 1000], msg: 'Description cannot exceed 1000 characters' },
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: { msg: 'Date must be a valid date' },
      notFuture(value) {
        if (new Date(value) > new Date()) {
          throw new Error('Transaction date cannot be in the future');
        }
      },
    },
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: { msg: 'User ID must be a valid integer' },
    },
  },
}, {
  tableName: 'financial_records',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['date'] },
    { fields: ['type'] },
    { fields: ['category'] },
    { fields: ['user_id', 'date'] },
  ],
});

FinancialRecord.prototype.toJSON = function () {
  const values = this.get();
  return {
    ...values,
    amount: parseFloat(values.amount),
  };
};

export default FinancialRecord;
