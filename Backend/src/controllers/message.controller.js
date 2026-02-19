const messageService = require('../services/message.service');

const createMessage = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const { message } = req.body;
    const user = req.user;

    const result = await messageService.createMessage(
      ticketId,
      message,
      user
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const user = req.user;

    const messages = await messageService.getMessages(ticketId, user);

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMessage,
  getMessages
};
