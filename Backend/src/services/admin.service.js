const adminRepository = require('../repositories/admin.repository');
const AppError = require('../utils/appError');

/**
 * Get all users (admin only)
 */
const getAllUsers = async (query = {}) => {
  return await adminRepository.getAllUsers(query);
};


const getAgentsByCategory = async (categoryId) => {
  if (!categoryId) {
    throw new AppError('Category ID is required', 400);
  }

  return await adminRepository.getAgentsByCategory(categoryId);
};


/**
 * Toggle user active status
 */
const toggleUserActiveStatus = async (adminId, userId) => {
  if (adminId === parseInt(userId)) {
    throw new AppError("Admin cannot deactivate themselves", 400);
  }

  // First fetch all users to find current status
  const users = await adminRepository.getAllUsers({ page: 1, limit: 1000 });
  const user = users.data.find(u => u.id === parseInt(userId));

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const newStatus = !user.is_active;

  await adminRepository.toggleUserActiveStatus(userId, newStatus);

  return { message: "User status updated successfully" };
};


/**
 * Update user role
 */
const updateUserRole = async (userId, role) => {
  const allowedRoles = ['user', 'agent', 'admin'];

  if (!allowedRoles.includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  await adminRepository.updateUserRole(userId, role);

  return { message: "User role updated successfully" };
};

const getTicketAnalytics = async () => {
  return await adminRepository.getTicketAnalytics();
};

module.exports = {
  getAllUsers,
  toggleUserActiveStatus,
  updateUserRole,
  getTicketAnalytics,
  getAgentsByCategory
};
