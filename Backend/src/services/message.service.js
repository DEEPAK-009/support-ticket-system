const ticketRepository = require('../repositories/ticket.repository');
const messageRepository = require('../repositories/message.repository');
const ticketActivityRepository = require('../repositories/ticketActivity.repository');
const { canTransition } = require('../utils/statusTransitions');
const messageEmitter = require('../utils/messageEvents');
const AppError = require('../utils/appError');

const createMessage = async (ticketId, messageText, user) => {
  if (!messageText) {
    throw new AppError('Message text is required', 400);
  }

  if (user.role === 'admin') {
    throw new AppError('Admins do not have access to ticket chat', 403);
  }

  const ticket = await ticketRepository.getTicketById(ticketId);

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  // Access control
  if (user.role === 'user' && ticket.created_by !== user.id) {
    throw new AppError('Forbidden: You cannot message this ticket', 403);
  }

  if (user.role === 'agent' && ticket.assigned_to !== user.id) {
    throw new AppError('Forbidden: You cannot message this ticket', 403);
  }

  const createdMessage = await messageRepository.createMessage(
  ticketId,
  user.id,
  messageText
);

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
    await ticketActivityRepository.createActivityLog({
      ticketId,
      actorId: user.id,
      eventType: 'status_changed',
      fieldName: 'status',
      oldValue: currentStatus,
      newValue: newStatus,
      description: `Status changed from ${currentStatus} to ${newStatus} after a new message`
    });
  }

  messageEmitter.emit('newMessage', {
    ticketId,
    message: createdMessage
  });

  return createdMessage;
};


const getNewMessages = async (ticketId, user, lastId) => {
  const ticket = await ticketRepository.getTicketById(ticketId);

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  if (user.role === 'user' && ticket.created_by !== user.id) {
    throw new AppError('Forbidden', 403);
  }

  if (user.role === 'agent' && ticket.assigned_to !== user.id) {
    throw new AppError('Forbidden', 403);
  }

  return await messageRepository.getNewMessages(ticketId, lastId);
};

const getMessages = async (ticketId, user) => {
  if (user.role === 'admin') {
    throw new AppError('Admins do not have access to ticket chat', 403);
  }

  const ticket = await ticketRepository.getTicketById(ticketId);

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  if (user.role === 'user' && ticket.created_by !== user.id) {
    throw new AppError('Forbidden', 403);
  }

  if (user.role === 'agent' && ticket.assigned_to !== user.id) {
    throw new AppError('Forbidden', 403);
  }

  return messageRepository.getMessagesByTicketId(ticketId);
};

module.exports = {
  createMessage,
  getNewMessages,
  getMessages
};
