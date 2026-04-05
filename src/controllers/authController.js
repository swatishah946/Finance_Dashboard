import * as authService from '../services/authService.js';

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.validatedBody;
      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
