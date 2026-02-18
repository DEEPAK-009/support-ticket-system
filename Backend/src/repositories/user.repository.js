// 🧠 What This Layer Does
    // Only SQL.
    // Nothing else.

// Later:
    // Service will call this
    // Controller will call service
    // This is clean layering.

const pool = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, full_name, email, role, department_id, is_active FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

const updateResetToken = async (userId, token, expiry) => {
  await pool.query(
    'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
    [token, expiry, userId]
  );
};

const updatePassword = async (userId, hashedPassword) => {
  await pool.query(
    'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
    [hashedPassword, userId]
  );
};

module.exports = {
  findByEmail,
  findById,
  updateResetToken,
  updatePassword
};
