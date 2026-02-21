const pool = require('../config/db');

const createTicket = async (data) => {
  const {
    title,
    description,
    category_id,
    priority,
    created_by
  } = data;

  const [result] = await pool.query(
    `INSERT INTO tickets 
     (title, description, category_id, priority, created_by) 
     VALUES (?, ?, ?, ?, ?)`,
    [title, description, category_id, priority, created_by]
  );

  return result.insertId;
};

const getTickets = async (user, filters) => {
  let baseQuery = `
    FROM tickets t
    LEFT JOIN categories c ON t.category_id = c.id
  `;

  let conditions = [];
  let values = [];

  if (user.role === 'user') {
    conditions.push('t.created_by = ?');
    values.push(user.id);
  }

  if (user.role === 'agent') {
    conditions.push('t.assigned_to = ?');
    values.push(user.id);
  }

  if (filters.status) {
    conditions.push('t.status = ?');
    values.push(filters.status);
  }

  if (filters.priority) {
    conditions.push('t.priority = ?');
    values.push(filters.priority);
  }

  if (filters.category_id) {
    conditions.push('t.category_id = ?');
    values.push(filters.category_id);
  }

  if (conditions.length > 0) {
    baseQuery += ' WHERE ' + conditions.join(' AND ');
  }

  const [countRows] = await pool.query(
    `SELECT COUNT(*) as total ${baseQuery}`,
    values
  );

  const total = countRows[0].total;

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 5;
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT t.*, c.name AS category_name ${baseQuery}
     ORDER BY t.updated_at DESC
     LIMIT ? OFFSET ?`,
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

const getTicketById = async (id) => {
  const [rows] = await pool.query(
    `SELECT t.*, c.name AS category_name
     FROM tickets t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.id = ?`,
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
    `UPDATE tickets 
     SET assigned_to = ?
     WHERE id = ?`,
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