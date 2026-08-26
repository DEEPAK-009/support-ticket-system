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

const findPasswordByUserId = async (id) => {
  const [rows] = await pool.query(
    'SELECT password_hash FROM users WHERE id = ?',
    [id]
  );
  return rows[0]?.password_hash;
};

const findResettableUserByToken = async (token) => {
  const [rows] = await pool.query(
    'SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW() LIMIT 1',
    [token]
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


const createUser = async ({
  full_name = null,
  email,
  password_hash,
  role = 'user',
  department_id = null,
  level = null,
  employee_id = null,
  is_active = 1
}) => {
  const name = full_name || email.split('@')[0];
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, password_hash, role, department_id, level, employee_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      name,
      email,
      password_hash,
      role,
      department_id ? parseInt(department_id) : null,
      level || null,
      employee_id || null,
      is_active
    ]
  );

  return {
    id: result.insertId,
    full_name: name,
    email,
    role,
    department_id: department_id ? parseInt(department_id) : null,
    level: level || null,
    employee_id: employee_id || null,
    is_active
  };
};

const getAllDepartments = async () => {
  const [rows] = await pool.query('SELECT id, name FROM departments ORDER BY name ASC');
  return rows;
};

module.exports = {
  findByEmail,
  findById,
  createUser,
  getAllDepartments,
  updateResetToken,
  updatePassword,
  findPasswordByUserId,
  findResettableUserByToken
};
