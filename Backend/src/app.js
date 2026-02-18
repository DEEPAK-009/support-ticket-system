const express = require('express');
const cors = require('cors');
require('./config/db'); // This initializes DB connection

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

app.get('/', (req, res) => {
  res.send('Server Working');
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

module.exports = app;
