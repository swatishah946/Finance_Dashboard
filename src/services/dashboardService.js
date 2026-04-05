import { FinancialRecord } from '../models/index.js';

class DashboardService {
  async getSummary(userId, userRole) {
    const where = userRole === 'admin' ? {} : { user_id: userId };

    const records = await FinancialRecord.findAll({
      where,
      attributes: ['type', 'amount'],
      raw: true,
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    for (const record of records) {
      const amount = parseFloat(record.amount);
      if (record.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpenses += amount;
      }
    }

    const netBalance = totalIncome - totalExpenses;

    return {
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      netBalance: parseFloat(netBalance.toFixed(2)),
      recordCount: records.length,
    };
  }

  async getCategoryBreakdown(userId, userRole) {
    const where = userRole === 'admin' ? {} : { user_id: userId };

    const records = await FinancialRecord.findAll({
      where,
      attributes: ['category', 'type', 'amount'],
      raw: true,
    });

    const breakdown = {};

    for (const record of records) {
      const amount = parseFloat(record.amount);
      if (!breakdown[record.category]) {
        breakdown[record.category] = { income: 0, expense: 0 };
      }
      breakdown[record.category][record.type] += amount;
    }

    return Object.entries(breakdown)
      .map(([category, values]) => ({
        category,
        income: parseFloat(values.income.toFixed(2)),
        expense: parseFloat(values.expense.toFixed(2)),
        net: parseFloat((values.income - values.expense).toFixed(2)),
      }))
      .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  }

  async getMonthlyTrends(userId, userRole, months = 12) {
    const where = userRole === 'admin' ? {} : { user_id: userId };

    const records = await FinancialRecord.findAll({
      where,
      attributes: ['date', 'type', 'amount'],
      raw: true,
      order: [['date', 'ASC']],
    });

    const trends = {};

    for (const record of records) {
      const d = new Date(record.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const amount = parseFloat(record.amount);

      if (!trends[monthKey]) {
        trends[monthKey] = { income: 0, expense: 0 };
      }
      trends[monthKey][record.type] += amount;
    }

    return Object.entries(trends)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-months)
      .map(([month, values]) => ({
        month,
        income: parseFloat(values.income.toFixed(2)),
        expense: parseFloat(values.expense.toFixed(2)),
        net: parseFloat((values.income - values.expense).toFixed(2)),
      }));
  }

  async getFinancialHealth(userId, userRole) {
    const summary = await this.getSummary(userId, userRole);

    if (summary.totalIncome === 0) {
      return {
        savingsRate: null,
        health: 'N/A',
        message: 'No income recorded',
      };
    }

    const savingsRate = ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100;
    const roundedRate = parseFloat(savingsRate.toFixed(2));

    let health = 'poor';
    if (roundedRate >= 20) health = 'good';
    else if (roundedRate >= 0) health = 'fair';

    return {
      savingsRate: roundedRate,
      health,
    };
  }
}

export default new DashboardService();
