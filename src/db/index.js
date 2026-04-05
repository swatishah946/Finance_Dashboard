import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || './finance.db',
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

const initializeDatabase = async () => {
  const { default: Role } = await import('../models/Role.js');
  const { default: User } = await import('../models/User.js');
  const { default: FinancialRecord } = await import('../models/FinancialRecord.js');

  Role.hasMany(User, { foreignKey: 'role_id', onDelete: 'RESTRICT' });
  User.belongsTo(Role, { foreignKey: 'role_id' });

  User.hasMany(FinancialRecord, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  FinancialRecord.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });

  await seedDatabase();
};

const seedDatabase = async () => {
  const { Role, User, FinancialRecord } = sequelize.models;

  const count = await Role.count();
  if (count > 0) return;

  const roles = await Role.bulkCreate([
    { name: 'viewer',  permissions: JSON.stringify(['read:records', 'read:dashboard']) },
    { name: 'analyst', permissions: JSON.stringify(['read:records', 'read:dashboard', 'create:records', 'update:own_records']) },
    { name: 'admin',   permissions: JSON.stringify(['read:records', 'read:dashboard', 'create:records', 'update:records', 'delete:records', 'manage:users']) },
  ]);

  const bcrypt = await import('bcryptjs');
  const hashed = bcrypt.default.hashSync('password123', 10);

  const users = await User.bulkCreate([
    { name: 'Admin User',   email: 'admin@example.com',   password: hashed, role_id: roles[2].id, status: 'active' },
    { name: 'Analyst User', email: 'analyst@example.com', password: hashed, role_id: roles[1].id, status: 'active' },
    { name: 'Viewer User',  email: 'viewer@example.com',  password: hashed, role_id: roles[0].id, status: 'active' },
  ]);

  const today = new Date();
  const d = (offset) => new Date(today.getFullYear(), today.getMonth(), offset);

  await FinancialRecord.bulkCreate([
    { amount: 5000, type: 'income',  category: 'salary',    description: 'Monthly salary',      date: d(1),  user_id: users[1].id },
    { amount: 2000, type: 'income',  category: 'freelance', description: 'Freelance project',   date: d(5),  user_id: users[1].id },
    { amount: 150,  type: 'expense', category: 'groceries', description: 'Weekly groceries',    date: d(10), user_id: users[1].id },
    { amount: 80,   type: 'expense', category: 'utilities', description: 'Electricity bill',    date: d(15), user_id: users[1].id },
  ]);

  console.log('[DB] Seeded — admin / analyst / viewer @example.com | password: password123');
};

const closeDatabase = async () => {
  await sequelize.close();
};

export { sequelize, initializeDatabase, closeDatabase };
