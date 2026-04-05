import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.ENUM('viewer', 'analyst', 'admin'),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
    },
  },
  permissions: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('permissions');
      try {
        return typeof raw === 'string' ? JSON.parse(raw) : (raw ?? []);
      } catch {
        return [];
      }
    },
    set(value) {
      this.setDataValue(
        'permissions',
        typeof value === 'string' ? value : JSON.stringify(value)
      );
    },
  },
}, {
  tableName: 'roles',
  timestamps: true,
  indexes: [{ fields: ['name'] }],
});

export default Role;
