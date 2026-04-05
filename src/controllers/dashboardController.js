import dashboardService from '../services/dashboardService.js';

class DashboardController {
  async getSummary(req, res, next) {
    try {
      const summary = await dashboardService.getSummary(req.user.id, req.user.role);
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBreakdown(req, res, next) {
    try {
      const breakdown = await dashboardService.getCategoryBreakdown(req.user.id, req.user.role);
      res.status(200).json({ success: true, data: breakdown });
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyTrends(req, res, next) {
    try {
      const months = Math.min(parseInt(req.query.months, 10) || 12, 60);
      const trends = await dashboardService.getMonthlyTrends(req.user.id, req.user.role, months);
      res.status(200).json({ success: true, data: trends });
    } catch (error) {
      next(error);
    }
  }

  async getFinancialHealth(req, res, next) {
    try {
      const health = await dashboardService.getFinancialHealth(req.user.id, req.user.role);
      res.status(200).json({ success: true, data: health });
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
