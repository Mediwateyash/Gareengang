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

app.get('/', (req, res) => {
  res.send('GareebGang API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
