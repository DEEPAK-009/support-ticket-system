const db = require('../config/db');

/**
 * Get all users (basic info)
 */
const getAllUsers = async () => {
  const [rows] = await db.execute(`
    SELECT 
      u.id,
      u.full_name,
      u.email,
      u.role,
      u.is_active,
      d.name AS department,
      u.created_at
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    ORDER BY u.created_at DESC
  `);

  return rows;
};


/**
 * Toggle user active status
 */
const toggleUserActiveStatus = async (userId, newStatus) => {
  const [result] = await db.execute(
    `UPDATE users SET is_active = ? WHERE id = ?`,
    [newStatus, userId]
  );

  return result;
};


/**
 * Update user role
 */
const updateUserRole = async (userId, role) => {
  const [result] = await db.execute(
    `UPDATE users SET role = ? WHERE id = ?`,
    [role, userId]
  );

  return result;
};

const getTicketAnalytics = async () => {
  const [rows] = await db.execute(`
    SELECT 
      COUNT(*) AS totalTickets,
      SUM(status = 'Open') AS open,
      SUM(status = 'In Progress') AS inProgress,
      SUM(status = 'Awaiting User Response') AS awaitingUserResponse,
      SUM(status = 'Resolved') AS resolved,
      SUM(status = 'Closed') AS closed
    FROM tickets
  `);

  return rows[0];
};

module.exports = {
  getAllUsers,
  toggleUserActiveStatus,
  updateUserRole,
  getTicketAnalytics
};