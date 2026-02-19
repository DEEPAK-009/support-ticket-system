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

// Just fetches ticket.
const getTicketById = async (id) => {
  const [rows] = await pool.query(
    `SELECT * FROM tickets WHERE id = ?`,
    [id]
  );

  return rows[0];
};

const updateTicketStatus = async (ticketId, newStatus) => {
  let extraFields = '';
  let values = [newStatus];

  if (newStatus === 'Resolved') {
    extraFields = ', resolved_at = NOW()';
  }

  if (newStatus === 'Closed') {
    extraFields = ', closed_at = NOW()';
  }

  values.push(ticketId);

  await pool.query(
    `UPDATE tickets 
     SET status = ? ${extraFields} 
     WHERE id = ?`,
    values
  );
};

const assignTicket = async (ticketId, agentId) => {
  await pool.query(
    `UPDATE tickets SET assigned_to = ? WHERE id = ?`,
    [agentId, ticketId]
  );
};


module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket
};
