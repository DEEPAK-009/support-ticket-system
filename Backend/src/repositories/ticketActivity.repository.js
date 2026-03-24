const pool = require('../config/db');

const createActivityLog = async ({
  ticketId,
  actorId = null,
  eventType,
  fieldName = null,
  oldValue = null,
  newValue = null,
  description
}) => {
  const [result] = await pool.query(
    `INSERT INTO ticket_activity_logs
      (ticket_id, actor_id, event_type, field_name, old_value, new_value, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [ticketId, actorId, eventType, fieldName, oldValue, newValue, description]
  );

  return result.insertId;
};

const getActivityByTicketId = async (ticketId) => {
  const [rows] = await pool.query(
    `SELECT
      tal.id,
      tal.ticket_id,
      tal.event_type,
      tal.field_name,
      tal.old_value,
      tal.new_value,
      tal.description,
      tal.created_at,
      u.id AS actor_id,
      u.full_name AS actor_name,
      u.role AS actor_role
    FROM ticket_activity_logs tal
    LEFT JOIN users u ON tal.actor_id = u.id
    WHERE tal.ticket_id = ?
    ORDER BY tal.created_at ASC, tal.id ASC`,
    [ticketId]
  );

  return rows;
};

module.exports = {
  createActivityLog,
  getActivityByTicketId
};
