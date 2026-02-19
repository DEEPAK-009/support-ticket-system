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

module.exports = {
  createTicket
};
