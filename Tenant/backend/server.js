const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notifications');
const viewingScheduleRoutes = require('./routes/viewingSchedule');
const roomRoutes = require('./routes/rooms');
const locationRoutes = require('./routes/locations');
const profileRoutes = require('./routes/profile');
const poiRoutes = require('./routes/poi');
const documentRoutes = require('./routes/documents');
const filterRoutes = require('./routes/filters');
const favoriteRoutes = require('./routes/favorites');
const movingServiceRoutes = require('./routes/movingService');

const app = express();

// Enable compression for all responses
app.use(compression());

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3333',
  'https://kltn-1o6k.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow for development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Cache control headers
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', viewingScheduleRoutes);
app.use('/api', roomRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/tenant', profileRoutes);
app.use('/api/poi', poiRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/tenant/favorites', favoriteRoutes);
app.use('/api/moving', movingServiceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
});
