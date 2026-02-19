// Ensures required fields exist
// Automatically sets:
    // created_by = logged in user
    // priority = Medium if not provided
// Returns structured response

const ticketRepository = require('../repositories/ticket.repository');

const createTicket = async (userId, data) => {
  const { title, description, category, priority } = data;

  if (!title || !description || !category) {
    throw new Error('Title, description and category are required');
  }

  const ticketId = await ticketRepository.createTicket({
    title,
    description,
    category,
    priority: priority || 'Medium',
    created_by: userId
  });

  return {
    id: ticketId,
    message: 'Ticket created successfully'
  };
};

module.exports = {
  createTicket
};
