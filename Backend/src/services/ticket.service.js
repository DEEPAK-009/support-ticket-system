// Ensures required fields exist
// Automatically sets:
    // created_by = logged in user
    // priority = Medium if not provided
// Returns structured response

const ticketRepository = require('../repositories/ticket.repository');
const ticketActivityRepository = require('../repositories/ticketActivity.repository');
const AppError = require('../utils/appError');

const createTicket = async (userId, data) => {
  const { title, description, category_id, priority } = data;

  if (!title || !description || !category_id) {
    throw new AppError('Title, description and category_id are required', 400);
  } 
  

  const ticketId = await ticketRepository.createTicket({
    title,
    description,
    category_id,
    priority: priority || 'Medium',
    created_by: userId
  });

  await ticketActivityRepository.createActivityLog({
    ticketId,
    actorId: userId,
    eventType: 'ticket_created',
    description: 'Ticket created'
  });

  return {
    id: ticketId,
    message: 'Ticket created successfully'
  };
};

const getTickets = async (user, queryParams) => {
  const tickets = await ticketRepository.getTickets(user, queryParams);
  return tickets;
};

// 1️⃣ Fetches ticket
// 2️⃣ Checks if it exists
// 3️⃣ Applies strict role-based access rules
const getTicketById = async (ticketId, user) => {
  const ticket = await ticketRepository.getTicketById(ticketId);

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  assertTicketAccess(ticket, user, 'access');

  const activity = await ticketActivityRepository.getActivityByTicketId(ticketId);

  return {
    ...ticket,
    activity
  };
};


// Fetch ticket
// Validate existence
// Validate access
// Validate transition rule
// Update DB
// Return confirmation
const { canTransition } = require('../utils/statusTransitions');
const updateTicketStatus = async (ticketId, newStatus, user) => {
  const ticket = await ticketRepository.getTicketById(ticketId);

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  assertTicketAccess(ticket, user, 'modify');

  const currentStatus = ticket.status;

  if (!canTransition(user.role, currentStatus, newStatus)) {
    throw new AppError(`Invalid status transition from ${currentStatus} to ${newStatus}`, 400);
  }

  await ticketRepository.updateTicketStatus(ticketId, newStatus);
  await ticketActivityRepository.createActivityLog({
    ticketId,
    actorId: user.id,
    eventType: 'status_changed',
    fieldName: 'status',
    oldValue: currentStatus,
    newValue: newStatus,
    description: `Status changed from ${currentStatus} to ${newStatus}`
  });

  return {
    message: 'Ticket status updated successfully'
  };
};


const userRepository = require('../repositories/user.repository');

const assignTicket = async (ticketId, agentId, user) => {
  // Only admin can assign
  if (user.role !== 'admin') {
    throw new AppError('Forbidden: Only admin can assign tickets', 403);
  }

  const ticket = await ticketRepository.getTicketById(ticketId);

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  const normalizedAgentId = agentId ? Number(agentId) : null;
  const previousAssignedTo = ticket.assigned_to;
  const previousAssignedToName = ticket.assigned_to_name || 'Unassigned';
  let nextAssignedToName = 'Unassigned';

  if (normalizedAgentId) {
    const agent = await userRepository.findById(normalizedAgentId);

    if (!agent || agent.role !== 'agent') {
      throw new AppError('Invalid agent selected', 400);
    }

    if (!ticket.category_department_id) {
      throw new AppError('Ticket category is invalid', 400);
    }

    if (agent.department_id !== ticket.category_department_id) {
      throw new AppError('Agent cannot handle tickets from this department', 400);
    }

    nextAssignedToName = agent.full_name;
  }

  await ticketRepository.assignTicket(ticketId, normalizedAgentId);

  if (String(previousAssignedTo || '') !== String(normalizedAgentId || '')) {
    await ticketActivityRepository.createActivityLog({
      ticketId,
      actorId: user.id,
      eventType: normalizedAgentId ? 'ticket_assigned' : 'ticket_unassigned',
      fieldName: 'assigned_to',
      oldValue: previousAssignedToName,
      newValue: nextAssignedToName,
      description: normalizedAgentId
        ? `Ticket assigned to ${nextAssignedToName}`
        : 'Ticket was unassigned'
    });
  }

  let nextStatus = null;

  if (normalizedAgentId && ticket.status === 'Open') {
    nextStatus = 'Assigned';
  }

  if (!normalizedAgentId && ['Assigned', 'In Progress', 'Awaiting User Response'].includes(ticket.status)) {
    nextStatus = 'Open';
  }

  if (nextStatus && nextStatus !== ticket.status) {
    await ticketRepository.updateTicketStatus(ticketId, nextStatus);
    await ticketActivityRepository.createActivityLog({
      ticketId,
      actorId: user.id,
      eventType: 'status_changed',
      fieldName: 'status',
      oldValue: ticket.status,
      newValue: nextStatus,
      description: `Status changed from ${ticket.status} to ${nextStatus}`
    });
  }

  return {
    message: normalizedAgentId ? 'Ticket assigned successfully' : 'Ticket unassigned successfully'
  };
};

const updateTicketPriority = async (ticketId, newPriority, user) => {
  const ticket = await ticketRepository.getTicketById(ticketId);

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  // Only admin can change priority
  if (user.role !== 'admin') {
    throw new AppError('Forbidden: Only admin can change priority', 403);
  }

  const allowedPriorities = ['Low', 'Medium', 'High'];

  if (!allowedPriorities.includes(newPriority)) {
    throw new AppError('Invalid priority value', 400);
  }

  await ticketRepository.updateTicketPriority(ticketId, newPriority);
  await ticketActivityRepository.createActivityLog({
    ticketId,
    actorId: user.id,
    eventType: 'priority_changed',
    fieldName: 'priority',
    oldValue: ticket.priority,
    newValue: newPriority,
    description: `Priority changed from ${ticket.priority} to ${newPriority}`
  });

  return {
    message: 'Ticket priority updated successfully'
  };
};

const startTicket = async (ticketId, agentId) => {
  const ticket = await ticketRepository.getTicketById(ticketId);

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  // Security: Ensure only the assigned agent can start it
  if (ticket.assigned_to !== agentId) {
    throw new AppError('Forbidden: You are not assigned to this ticket', 403);
  }

  // Use your transition utility to verify Assigned -> In Progress
  if (!canTransition('agent', ticket.status, 'In Progress')) {
    throw new AppError(`Invalid transition from ${ticket.status} to In Progress`, 400);
  }

  await ticketRepository.updateTicketStatus(ticketId, 'In Progress');
  await ticketActivityRepository.createActivityLog({
    ticketId,
    actorId: agentId,
    eventType: 'ticket_started',
    fieldName: 'status',
    oldValue: ticket.status,
    newValue: 'In Progress',
    description: 'Assigned agent started work on the ticket'
  });

  return { message: 'Ticket started successfully' };
};

function assertTicketAccess(ticket, user, action) {
  if (user.role === 'user' && ticket.created_by !== user.id) {
    throw new AppError(`Forbidden: You cannot ${action} this ticket`, 403);
  }

  if (user.role === 'agent' && ticket.assigned_to !== user.id) {
    throw new AppError(`Forbidden: You cannot ${action} this ticket`, 403);
  }
}

// Add startTicket to module.exports

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketPriority,
  updateTicketStatus,
  assignTicket,
  startTicket
};
