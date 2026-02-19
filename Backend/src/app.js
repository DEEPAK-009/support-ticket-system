const express = require('express');
const cors = require('cors');
require('./config/db'); 
const authRoutes = require('./routes/auth.routes');
const authMiddleware = require('./middleware/auth.middleware');
const requireRole = require('./middleware/role.middleware');
const ticketRoutes = require('./routes/ticket.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/tickets', ticketRoutes);

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

app.get(
  '/admin-only',
  authMiddleware,
  requireRole('admin'),
  (req, res) => {
    res.json({ message: 'Admin access granted' });
  }
);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'You accessed a protected route',
    user: req.user
  });
});

// 🔥 Add this HERE
app.use('/api/auth', authRoutes);

const errorHandler = require('./middleware/error.middleware');
app.use(errorHandler);


module.exports = app;
