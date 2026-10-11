const config = require('./config');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();

// Railway and most PaaS hosts run the app behind a reverse proxy
app.set('trust proxy', 1);

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no Origin header (curl, server-to-server, health checks)
    if (!origin) return callback(null, true);
    return callback(null, config.CLIENT_URLS.includes(origin.replace(/\/+$/, '')));
  },
}));
app.use(express.json());
app.use(morgan(config.isProduction ? 'combined' : 'dev'));

// Health check: no auth, responds even while the DB is still connecting
app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    db: states[mongoose.connection.readyState] || 'unknown',
    uptime: Math.round(process.uptime()),
  });
});

// API routes
app.use('/api', require('./routes'));

// Unknown API routes
app.use('/api', (req, res) => res.status(404).json({ msg: 'Not found' }));

// Connect to MongoDB
mongoose.connect(config.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// Cron jobs
require('./cron/dailyCron');

app.listen(config.PORT, () => {
  console.log(`Server listening on port ${config.PORT} (${config.NODE_ENV})`);
});
