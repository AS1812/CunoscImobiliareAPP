// routes/rentals.js - Streamlined version
const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const fs = require('fs').promises;
const path = require('path');

// Very simple endpoint to just check database connection
router.get('/check', async (req, res) => {
  try {
    // Just count documents to verify connection
    const count = await Rental.countDocuments().limit(10);
    res.json({ connected: true, count });
  } catch (err) {
    console.error('Database check failed:', err);
    res.status(500).json({ error: 'Database check failed', message: err.message });
  }
});

// Super light statistics endpoint - minimal processing
router.get('/stats-lite/:rooms', async (req, res) => {
  try {
    const { rooms } = req.params;
    const sanitizedRooms = rooms.replace(/[^0-9]/g, '');
    
    // Find just a few documents to validate the query
    const sample = await Rental.find({
      'details.rooms': { $regex: new RegExp(`^${sanitizedRooms}( |$)`, 'i') }
    }).limit(5).lean();
    
    // Return a simplified response
    res.json({
      success: true,
      count: sample.length,
      message: "Using simplified endpoint due to serverless limitations",
      sample
    });
  } catch (err) {
    console.error('Error in stats-lite:', err);
    res.status(500).json({ error: 'Stats query failed', message: err.message });
  }
});

// Super simple map endpoint with no database connection
router.get('/map-static', async (req, res) => {
  try {
    // Just return the static GeoJSON file
    const geojsonPath = path.join(__dirname, '../map.geojson');
    console.log('Loading static GeoJSON from:', geojsonPath);
    
    const geojsonData = await fs.readFile(geojsonPath, 'utf8');
    const geojson = JSON.parse(geojsonData);
    
    console.log('GeoJSON loaded successfully with', geojson.features.length, 'features');
    
    // Add some example data to verify it's working
    if (geojson.features && geojson.features.length) {
      geojson.features = geojson.features.map(feature => ({
        ...feature,
        properties: {
          ...feature.properties,
          // Add some placeholder data
          sampleData: {
            price: Math.floor(Math.random() * 500) + 200,
            listings: Math.floor(Math.random() * 20) + 1
          }
        }
      }));
    }
    
    res.json(geojson);
  } catch (err) {
    console.error('Error in map-static:', err);
    res.status(500).json({ error: 'GeoJSON loading failed', message: err.message });
  }
});

// Keep the original routes, but they might time out in serverless
router.get('/stats/:rooms', async (req, res) => {
  try {
    const { rooms } = req.params;
    const sanitizedRooms = rooms.replace(/[^0-9]/g, '');
    
    // Using count only for quick estimation
    const count = await Rental.countDocuments({
      'details.rooms': { $regex: new RegExp(`^${sanitizedRooms}( |$)`, 'i') }
    });
    
    if (count > 200) {
      return res.json({
        message: "Too many records for serverless function. Try /stats-lite endpoint instead.",
        count
      });
    }
    
    // Simplified aggregation for small datasets only
    const statistics = await Rental.aggregate([
      {
        $match: { 
          'details.rooms': { $regex: new RegExp(`^${sanitizedRooms}( |$)`, 'i') }
        }
      },
      { $limit: 200 }, // Hard limit to prevent timeout
      {
        $group: {
          _id: '$mapped_zone',
          PretMediu: { $avg: { $toDouble: '$price.amount' } },
          PretMinim: { $min: { $toDouble: '$price.amount' } },
          PretMaxim: { $max: { $toDouble: '$price.amount' } },
          NumarAnunturi: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          ZonăApartament: '$_id',
          PretMediu: { $round: ['$PretMediu', 0] },
          PretMinim: { $round: ['$PretMinim', 0] },
          PretMaxim: { $round: ['$PretMaxim', 0] },
          NumarAnunturi: 1
        }
      }
    ]);
    
    res.json(statistics);
  } catch (err) {
    console.error('Error in full stats:', err);
    res.status(500).json({ 
      error: 'Stats aggregation failed', 
      message: err.message,
      suggestion: 'Try using /stats-lite endpoint instead'
    });
  }
});

// Export the router
module.exports = router;