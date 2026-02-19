// Read request body
// Extract logged-in user
// Call service
// Send response
// Handle errors

const ticketService = require('../services/ticket.service');

const createTicket = async (req, res, next) => {
  try {
    const userId = req.user.id; // comes from auth middleware
    const result = await ticketService.createTicket(userId, req.body);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket
};
