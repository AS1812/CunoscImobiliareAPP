// server.js - Fixed to handle MongoDB connection properly
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rentalRoutes = require('./routes/rentals');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Handle preflight requests
app.options('*', cors());

// Serve static files from the root directory (for map.geojson)
app.use(express.static(path.join(__dirname, '.')));

// Add a simple homepage route that doesn't require DB connection
app.get('/', (req, res) => {
  res.send('Timisoara Real Estate API - Database status: ' + 
           (mongoose.connection.readyState ? 'connected' : 'disconnected'));
});

// API health check endpoint that doesn't require DB connection
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV,
    database: dbStatus
  });
});

// Debug endpoint to verify environment variables (safely)
app.get('/api/debug-env', (req, res) => {
  const mongoUri = process.env.MONGO_URI || 'not set';
  
  res.json({
    mongoUri: mongoUri !== 'not set' ? 
      `Set (first few chars: ${mongoUri.substring(0, 10)}...)` : 
      'Not set',
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL ? 'Yes' : 'No'
  });
});

// Serve a static GeoJSON file without database connection
app.get('/api/rentals/map-static', async (req, res) => {
  try {
    const geojsonPath = path.join(__dirname, './map.geojson');
    console.log('Loading static GeoJSON from:', geojsonPath);
    
    const fs = require('fs').promises;
    const geojsonData = await fs.readFile(geojsonPath, 'utf8');
    res.json(JSON.parse(geojsonData));
  } catch (err) {
    console.error('Error loading static map data:', err);
    res.status(500).json({ message: err.message });
  }
});

// Separate routes that require database connection
const connectDB = async () => {
  try {
    // Get the MongoDB URI from environment variables with clear fallback
    const MONGO_URI = process.env.MONGO_URI;
    
    if (!MONGO_URI) {
      console.error('MONGO_URI environment variable is not set');
      console.log('Falling back to default local MongoDB URI');
      // Return false to indicate we couldn't connect
      return false;
    }
    
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB with optimized settings
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    
    console.log('MongoDB connected successfully');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    return false;
  }
};

// Add database routes with connection handling
app.use('/api/rentals', async (req, res, next) => {
  // Skip connection for static endpoints
  if (req.path === '/map-static') return next();
  
  try {
    // Only try to connect if not already connected
    if (mongoose.connection.readyState !== 1) {
      const connected = await connectDB();
      if (!connected) {
        return res.status(500).json({ 
          error: 'Database connection failed. Please check your MongoDB connection string.' 
        });
      }
    }
    next();
  } catch (err) {
    console.error('Error in database middleware:', err);
    return res.status(500).json({ error: 'Database connection error' });
  }
}, rentalRoutes);

// Only listen on a port in non-Vercel environments
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express app for Vercel serverless function
module.exports = app;