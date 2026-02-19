const pool = require('../config/db');

const createMessage = async (ticketId, senderId, messageText) => {
  await pool.query(
    `INSERT INTO ticket_messages (ticket_id, sender_id, message_text)
     VALUES (?, ?, ?)`,
    [ticketId, senderId, messageText]
  );
};

const getMessagesByTicketId = async (ticketId) => {
  const [rows] = await pool.query(
    `SELECT tm.id, tm.message_text, tm.created_at,
            u.full_name, u.role
     FROM ticket_messages tm
     JOIN users u ON tm.sender_id = u.id
     WHERE tm.ticket_id = ?
     ORDER BY tm.created_at ASC`,
    [ticketId]
  );

  return rows;
};

module.exports = {
  createMessage,
  getMessagesByTicketId
};
