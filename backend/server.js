const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/users',   require('./routes/users'));
app.use('/api/events',  require('./routes/events'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/orders',  require('./routes/orders'));
app.use('/api/payments',require('./routes/payments'));
app.use('/api/speakers',require('./routes/speakers'));
app.use('/api/venues',  require('./routes/venues'));

// Catch-all: serve frontend index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 EventPro Server running at http://localhost:${PORT}`);
});
