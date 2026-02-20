const adminService = require('../services/admin.service');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const toggleUserActiveStatus = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const userId = req.params.id;

    const result = await adminService.toggleUserActiveStatus(adminId, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    const result = await adminService.updateUserRole(userId, role);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getTicketAnalytics = async (req, res, next) => {
  try {
    const analytics = await adminService.getTicketAnalytics();
    res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  toggleUserActiveStatus,
  updateUserRole,
  getTicketAnalytics
};