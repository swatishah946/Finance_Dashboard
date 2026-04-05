import userService from '../services/userService.js';

class UserController {
  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.validatedBody);
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.validatedBody;
      await userService.changePassword(req.user.id, oldPassword, newPassword);
      
      res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.validatedBody;
      
      // Prevent an admin from deactivating themselves
      if (parseInt(id) === req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You cannot change your own status'
        });
      }

      const updatedUser = await userService.updateUserStatus(id, status);
      
      res.status(200).json({
        success: true,
        message: `User status changed to ${status}`,
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
