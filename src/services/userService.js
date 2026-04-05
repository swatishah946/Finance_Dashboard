import { User, Role } from '../models/index.js';

class UserService {
  async createUser(data) {
    const role = await Role.findOne({ where: { name: data.role } });
    if (!role) {
      const err = new Error('Invalid role specified');
      err.status = 400;
      err.isApplicationError = true;
      throw err;
    }

    const emailExists = await User.findOne({ where: { email: data.email } });
    if (emailExists) {
      const err = new Error('A user with this email already exists');
      err.status = 400;
      err.isApplicationError = true;
      throw err;
    }

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role_id: role.id
    });

    const userObj = user.toJSON();
    delete userObj.password;
    delete userObj.deletedAt;
    
    return userObj;
  }

  async getAllUsers() {
    return await User.findAll({
      attributes: ['id', 'name', 'email', 'status', 'createdAt', 'last_login_at'],
      include: [{ model: Role, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.scope('withPassword').findByPk(userId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      err.isApplicationError = true;
      throw err;
    }

    if (!user.comparePassword(oldPassword)) {
      const err = new Error('Incorrect current password');
      err.status = 401;
      err.isApplicationError = true;
      throw err;
    }

    user.password = newPassword;
    await user.save();
    return true;
  }
  async updateUserStatus(userId, status) {
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      err.isApplicationError = true;
      throw err;
    }

    user.status = status;
    await user.save();
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status
    };
  }
}

export default new UserService();
