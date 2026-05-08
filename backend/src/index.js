const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const uploadRoutes = require('./routes/uploadRoutes');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', uploadRoutes);
app.use('/api', productRoutes);
app.use('/api', reviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// ============================
// React Frontend Build Setup
// ============================

const frontendPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(frontendPath));

// React routes handling
app.get((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ============================
// Error Handling
// ============================

// Error middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});