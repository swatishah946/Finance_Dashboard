import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../db/index.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: { args: [2, 255], msg: 'Name must be between 2 and 255 characters' },
      notEmpty: { msg: 'Name cannot be blank' },
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: { msg: 'An account with this email already exists' },
    validate: {
      isEmail: { msg: 'Please provide a valid email address' },
      len: { args: [5, 255], msg: 'Email is too short or too long' },
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: { args: [6, 255], msg: 'Password must be at least 6 characters' },
    },
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    validate: {
      isIn: { args: [['active', 'inactive']], msg: 'Status must be active or inactive' },
    },
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: { msg: 'Role ID must be a valid integer' },
    },
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  defaultScope: {
    attributes: { exclude: ['password'] },
  },
  scopes: {
    withPassword: {
      attributes: {},
    },
  },
  indexes: [
    { fields: ['email'] },
    { fields: ['role_id'] },
    { fields: ['status'] },
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = bcrypt.hashSync(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = bcrypt.hashSync(user.password, 10);
      }
    },
  },
});

User.prototype.comparePassword = function (candidate) {
  if (!candidate || !this.password) return false;
  return bcrypt.compareSync(candidate, this.password);
};

User.prototype.toJSON = function () {
  const values = this.get();
  delete values.password;
  return values;
};

export default User;
