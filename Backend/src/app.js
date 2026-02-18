const express = require('express');
const cors = require('cors');
require('./config/db'); 
const authRoutes = require('./routes/auth.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

// Public routes
app.get('/', (req, res) => {
  res.send('Server Working');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// 🔥 Add this HERE
app.use('/api/auth', authRoutes);

const errorHandler = require('./middleware/error.middleware');
app.use(errorHandler);


module.exports = app;
