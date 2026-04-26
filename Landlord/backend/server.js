const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notifications');
const viewingScheduleRoutes = require('./routes/viewingSchedule');
const roomRoutes = require('./routes/rooms');
const buildingRoutes = require('./routes/buildings');
const dashboardRoutes = require('./routes/dashboard');
const listingRoutes = require('./routes/listings');
const bulkUploadRoutes = require('./routes/bulkUpload');
const documentRoutes = require('./routes/documents');
const locationRoutes = require('./routes/locations');
const profileRoutes = require('./routes/profile');
const roomAttributeRoutes = require('./routes/roomAttributes');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/schedule', viewingScheduleRoutes);
app.use('/api/schedules', viewingScheduleRoutes); // Alias for compatibility
app.use('/api/rooms', roomRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bulk', bulkUploadRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/room-attributes', roomAttributeRoutes);

// All files are now served from Cloudinary - no local file serving needed

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
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
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5555;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});
