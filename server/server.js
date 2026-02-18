const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB().then(() => {
  require('./seed')();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/memories', require('./routes/memories'));
app.use('/api/vlogs', require('./routes/vlogs'));
app.use('/api/categories', require('./routes/categories')); // Dynamic Categories
app.use('/api/setup', require('./routes/setup')); // One-click setup


const path = require('path');
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/', (req, res) => {
  res.send('GareebGang API is running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Trigger restart for Vlogs
