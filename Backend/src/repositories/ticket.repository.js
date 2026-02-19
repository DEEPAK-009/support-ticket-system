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

const getTickets = async (user, filters) => {
  let query = `SELECT * FROM tickets`;
  let conditions = [];
  let values = [];

  // Role-based filtering
  if (user.role === 'user') {
    conditions.push('created_by = ?');
    values.push(user.id);
  }

  if (user.role === 'agent') {
    conditions.push('assigned_to = ?');
    values.push(user.id);
  }

  // Optional filters
  if (filters.status) {
    conditions.push('status = ?');
    values.push(filters.status);
  }

  if (filters.priority) {
    conditions.push('priority = ?');
    values.push(filters.priority);
  }

  if (filters.category) {
    conditions.push('category = ?');
    values.push(filters.category);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY updated_at DESC';

  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 5;
  const offset = (page - 1) * limit;

  query += ' LIMIT ? OFFSET ?';
  values.push(limit, offset);

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
