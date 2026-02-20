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
  let baseQuery = `FROM tickets`;
  let conditions = [];
  let values = [];

  // Role filtering
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
    baseQuery += ' WHERE ' + conditions.join(' AND ');
  }

  // Get total count
  const [countRows] = await pool.query(
    `SELECT COUNT(*) as total ${baseQuery}`,
    values
  );

  const total = countRows[0].total;

  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 5;
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT * ${baseQuery} ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  return {
    data: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
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
