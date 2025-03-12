// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rentalRoutes = require('./routes/rentals');
const path = require('path');

const app = express();

// CORS configuration for Vercel deployment
app.use(cors({
  origin: '*', // Temporarily allow all origins while debugging
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Handle preflight requests
app.options('*', cors());

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

// Debug endpoint to verify environment variables
app.get('/api/debug-env', (req, res) => {
  res.json({
    mongoUri: process.env.MONGO_URI ? 'Set (first few chars: ' + process.env.MONGO_URI.substring(0, 15) + '...)' : 'Not set',
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
    // Get the MongoDB URI from environment variables
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rentals';
    console.log('Connecting to MongoDB...');
    console.log('URI length:', MONGO_URI.length);
    console.log('URI starts with:', MONGO_URI.substring(0, 20));
    
    // Connect to MongoDB with optimized settings for Vercel
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
          error: 'Database connection failed. Try using static endpoints.' 
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