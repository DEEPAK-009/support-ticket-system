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

const getTickets = async (user) => {
  const tickets = await ticketRepository.getTickets(user);
  return tickets;
};

// 1️⃣ Fetches ticket
// 2️⃣ Checks if it exists
// 3️⃣ Applies strict role-based access rules
const getTicketById = async (ticketId, user) => {
  const ticket = await ticketRepository.getTicketById(ticketId);

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  // Access control logic
  if (user.role === 'user' && ticket.created_by !== user.id) {
    throw new Error('Forbidden: You cannot access this ticket');
  }

  if (user.role === 'agent' && ticket.assigned_to !== user.id) {
    throw new Error('Forbidden: You cannot access this ticket');
  }

  // Admin can access everything

  return ticket;
};


module.exports = {
  createTicket,
  getTickets,
  getTicketById
};
