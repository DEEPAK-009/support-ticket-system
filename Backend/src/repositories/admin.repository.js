const db = require('../config/db');

/**
 * Get all users (basic info)
 */
const getAllUsers = async ({ page = 1, limit = 8 } = {}) => {
  const normalizedPage = Number(page) > 0 ? Number(page) : 1;
  const normalizedLimit = Number(limit) > 0 ? Number(limit) : 8;
  const offset = (normalizedPage - 1) * normalizedLimit;

  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS total FROM users`
  );

  const [rows] = await db.execute(
    `SELECT 
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
    LIMIT ? OFFSET ?`,
    [normalizedLimit, offset]
  );

  return {
    data: rows,
    total: countRows[0].total,
    page: normalizedPage,
    limit: normalizedLimit,
    totalPages: Math.ceil(countRows[0].total / normalizedLimit)
  };
};

const pool = require('../config/db');

const getAgentsByCategory = async (categoryId) => {
  const [rows] = await pool.query(
    `
    SELECT 
      u.id,
      u.full_name,
      u.email,
      u.level
    FROM users u
    JOIN categories c 
      ON u.department_id = c.department_id
    WHERE 
      c.id = ?
      AND u.role = 'agent'
      AND u.is_active = TRUE
    ORDER BY u.full_name ASC
    `,
    [categoryId]
  );

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
  getTicketAnalytics,
  getAgentsByCategory
};
