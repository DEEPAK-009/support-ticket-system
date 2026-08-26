const authService = require('../services/auth.service');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    await authService.forgotPassword(email);

    res.status(200).json({
      message: 'If the account exists, a reset link has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, new_password } = req.body;

    await authService.resetPassword(token, new_password);

    res.status(200).json({
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

// Add to Backend/src/controllers/auth.controller.js
const changePassword = async (req, res, next) => {
  try {
    const { old_password, new_password } = req.body;
    const userId = req.user.id; // Populated by authMiddleware

    await authService.changePassword(userId, old_password, new_password);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    res.status(200).json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        department_id: user.department_id,
        is_active: user.is_active
      }
    });
  } catch (error) {
    next(error);
  }
};

const verifyAdminPassword = async (req, res, next) => {
  try {
    const { adminPassword } = req.body;
    const result = await authService.verifyAdminPassword(adminPassword);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const adminCreateUser = async (req, res, next) => {
  try {
    const {
      email,
      password,
      full_name,
      role,
      department_id,
      level,
      employee_id,
      adminToken,
      adminPassword
    } = req.body;
    // Also check Bearer header if passed as fallback
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    const result = await authService.adminCreateUser({
      email,
      password,
      full_name,
      role,
      department_id,
      level,
      employee_id,
      adminToken: adminToken || bearerToken,
      adminPassword
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getDepartments = async (req, res, next) => {
  try {
    const departments = await authService.getDepartments();
    res.status(200).json(departments);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
  verifyAdminPassword,
  adminCreateUser,
  getDepartments
};
