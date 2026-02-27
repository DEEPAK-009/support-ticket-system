const messageService = require('../services/message.service');

const createMessage = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const { message } = req.body;
    const user = req.user;

    const newMessage = await messageService.createMessage(ticketId, user, message);

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const user = req.user;
    const lastSeenMessageId = req.query.lastId ? parseInt(req.query.lastId) : 0;

    const timeout = 30000; // 30 seconds max hold
    const pollInterval = 2000; // Check DB every 2 seconds
    const startTime = Date.now();

    const poll = async () => {
      const messages = await messageService.getMessages(ticketId, user);
      
      // Filter for only messages the client hasn't seen yet
      const newMessages = messages.filter(msg => msg.id > lastSeenMessageId);

      if (newMessages.length > 0) {
        return res.status(200).json(newMessages);
      }

      // If no new messages and time isn't up, wait and try again
      if (Date.now() - startTime < timeout) {
        setTimeout(poll, pollInterval);
      } else {
        // Send empty response so client can start a fresh request
        res.status(200).json([]);
      }
    };

    poll();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  createMessage 
};