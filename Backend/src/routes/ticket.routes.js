const express = require('express');
const router = express.Router();

const ticketController = require('../controllers/ticket.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, ticketController.createTicket);
router.get('/', authMiddleware, ticketController.getTickets);
router.get('/:id', authMiddleware, ticketController.getTicketById);
router.patch('/:id/status', authMiddleware, ticketController.updateTicketStatus);
router.patch('/:id/assign', authMiddleware, ticketController.assignTicket);




module.exports = router;
