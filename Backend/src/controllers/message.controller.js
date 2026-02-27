const messageService = require('../services/message.service');

const getMessagesLongPolling = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const user = req.user;
    const lastMessageId = req.query.lastMessageId; // Frontend tracks the last ID it saw

    // Timeout after 30 seconds to prevent gateway timeouts
    const timeout = 30000; 
    const startTime = Date.now();

    const checkForUpdates = async () => {
      const messages = await messageService.getMessages(ticketId, user);
      
      // Check if there's a message newer than what the client has
      const newMessages = lastMessageId 
        ? messages.filter(m => m.id > lastMessageId) 
        : messages;

      if (newMessages.length > 0 || (Date.now() - startTime) > timeout) {
        return res.status(200).json(newMessages);
      }

      // If no new messages, wait 2 seconds and check again
      setTimeout(checkForUpdates, 2000);
    };

    checkForUpdates();
  } catch (error) {
    next(error);
  }
};