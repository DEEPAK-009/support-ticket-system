// Inserts a new ticket into DB
// Returns new ticket ID

const pool = require('../config/db');

const createTicket = async (data) => {
  const {
    title,
    description,
    category,
    priority,
    created_by
  } = data;

  const [result] = await pool.query(
    `INSERT INTO tickets 
     (title, description, category, priority, created_by) 
     VALUES (?, ?, ?, ?, ?)`,
    [title, description, category, priority, created_by]
  );

  return result.insertId;
};

// Dynamically builds query based on role
// Admin sees everything (no WHERE)
// Sorted newest first

const getTickets = async (user) => {
  let query = `
    SELECT * FROM tickets
  `;
  let values = [];

  if (user.role === 'user') {
    query += ` WHERE created_by = ?`;
    values.push(user.id);
  }

  if (user.role === 'agent') {
    query += ` WHERE assigned_to = ?`;
    values.push(user.id);
  }

  query += ` ORDER BY updated_at DESC`;

  const [rows] = await pool.query(query, values);
  return rows;
};


module.exports = {
  createTicket,
  getTickets
};
