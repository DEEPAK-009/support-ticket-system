const ticketRepository = require('../repositories/ticket.repository');
const messageRepository = require('../repositories/message.repository');
const { canTransition } = require('../utils/statusTransitions');

const createMessage = async (ticketId, messageText, user) => {
  if (!messageText) {
    throw new Error('Message text is required');
  }

  const ticket = await ticketRepository.getTicketById(ticketId);

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  // Access control
  if (user.role === 'user' && ticket.created_by !== user.id) {
    throw new Error('Forbidden: You cannot message this ticket');
  }

  if (user.role === 'agent' && ticket.assigned_to !== user.id) {
    throw new Error('Forbidden: You cannot message this ticket');
  }

  await messageRepository.createMessage(ticketId, user.id, messageText);

  // Auto status updates
  const currentStatus = ticket.status;

  let newStatus = null;

  if (user.role === 'agent' && currentStatus === 'In Progress') {
    newStatus = 'Awaiting User Response';
  }

  if (user.role === 'user' && currentStatus === 'Awaiting User Response') {
    newStatus = 'In Progress';
  }

  if (newStatus && canTransition(user.role, currentStatus, newStatus)) {
    await ticketRepository.updateTicketStatus(ticketId, newStatus);
  }

  return {
    message: 'Message added successfully'
  };
};

const getMessages = async (ticketId, user) => {
  const ticket = await ticketRepository.getTicketById(ticketId);

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  // Same access validation
  if (user.role === 'user' && ticket.created_by !== user.id) {
    throw new Error('Forbidden: You cannot view this ticket');
  }

  if (user.role === 'agent' && ticket.assigned_to !== user.id) {
    throw new Error('Forbidden: You cannot view this ticket');
  }

  const messages = await messageRepository.getMessagesByTicketId(ticketId);

  return messages;
};

module.exports = {
  createMessage,
  getMessages
};
