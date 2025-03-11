// routes/rentals.js
const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const fs = require('fs').promises;
const path = require('path');

// Get all rentals
router.get('/', async (req, res) => {
  try {
    const rentals = await Rental.find();
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get statistics by room count
router.get('/stats/:rooms', async (req, res) => {
  try {
    const { rooms } = req.params;
    
    // Aggregate rentals by room count and mapped zone
            // Ensure rooms param is sanitized
        const sanitizedRooms = rooms.replace(/[^0-9]/g, '');
        console.log(`Processing stats for rooms: ${sanitizedRooms}`);
        
        const statistics = await Rental.aggregate([
      {
        $match: { 
          'mapped_zone': { $exists: true, $ne: null },
          'details.rooms': { $regex: new RegExp(`^${sanitizedRooms}( |$)`, 'i') }
        }
      },
      {
        $group: {
          _id: '$mapped_zone',
          PretMediu: { 
            $avg: { 
              $cond: [
                { $eq: ['$price.currency', 'RON'] },
                { $divide: [{ $toDouble: '$price.amount' }, 4.9] }, // Convert RON to EUR
                { $toDouble: '$price.amount' }
              ]
            } 
          },
          PretMinim: { 
            $min: { 
              $cond: [
                { $eq: ['$price.currency', 'RON'] },
                { $divide: [{ $toDouble: '$price.amount' }, 4.9] },
                { $toDouble: '$price.amount' }
              ]
            } 
          },
          PretMaxim: { 
            $max: { 
              $cond: [
                { $eq: ['$price.currency', 'RON'] },
                { $divide: [{ $toDouble: '$price.amount' }, 4.9] },
                { $toDouble: '$price.amount' }
              ]
            } 
          },
          NumarAnunturi: { $sum: 1 },
          MetriPartrati_InMedie: { 
            $avg: { 
              $toDouble: { 
                $replaceAll: { 
                  input: '$details.area', 
                  find: ' m²', 
                  replacement: '' 
                } 
              } 
            } 
          }
        }
      },
      {
        $project: {
          _id: 0,
          ZonăApartament: { 
            $cond: [
              { $eq: ['$_id', null] },
              'Unknown Zone',
              '$_id'
            ]
          },
          PretMediu: { 
            $cond: [
              { $eq: ['$PretMediu', null] },
              0,
              { $round: ['$PretMediu', 0] }
            ]
          },
          PretMinim: { 
            $cond: [
              { $eq: ['$PretMinim', null] },
              0,
              { $round: ['$PretMinim', 0] }
            ]
          },
          PretMaxim: { 
            $cond: [
              { $eq: ['$PretMaxim', null] },
              0,
              { $round: ['$PretMaxim', 0] }
            ]
          },
          NumarAnunturi: { 
            $cond: [
              { $eq: ['$NumarAnunturi', null] },
              0,
              '$NumarAnunturi'
            ]
          },
          MetriPartrati_InMedie: { 
            $cond: [
              { $eq: ['$MetriPartrati_InMedie', null] },
              0,
              { $round: ['$MetriPartrati_InMedie', 0] }
            ]
          },
          PretMediu_MetruPatrat: { 
            $cond: [
              { $or: [
                { $eq: ['$PretMediu', null] },
                { $eq: ['$MetriPartrati_InMedie', null] },
                { $eq: ['$MetriPartrati_InMedie', 0] }
              ]},
              0,
              { $round: [{ $divide: ['$PretMediu', '$MetriPartrati_InMedie'] }, 0] }
            ]
          }
        }
      },
      { $sort: { ZonăApartament: 1 } }
    ]);
    
    res.json(statistics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get map data with statistics
router.get('/map', async (req, res) => {
  try {
    // Get GeoJSON file
    let geojsonPath = path.join(__dirname, '../../frontend/public/map.geojson');
    
    // Check if file exists at that path, if not try in the backend directory
    try {
      await fs.access(geojsonPath);
    } catch (err) {
      console.log('GeoJSON not found in frontend/public, trying backend directory');
      geojsonPath = path.join(__dirname, '../map.geojson');
    }
    
    console.log('Loading GeoJSON from:', geojsonPath);
    const geojsonData = await fs.readFile(geojsonPath, 'utf8');
    const geojson = JSON.parse(geojsonData);
    
    console.log('GeoJSON loaded successfully with', geojson.features.length, 'features');
    
    // Aggregate statistics for all zones
    const statistics = await Rental.aggregate([
      {
        $match: { 'mapped_zone': { $ne: 'Unknown' } }
      },
      {
        $group: {
          _id: '$mapped_zone',
          PretMediu: { 
            $avg: { 
              $cond: [
                { $eq: ['$price.currency', 'RON'] },
                { $divide: [{ $toDouble: '$price.amount' }, 4.9] },
                { $toDouble: '$price.amount' }
              ]
            } 
          },
          NumarAnunturi: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          zone: '$_id',
          PretMediu: { $round: ['$PretMediu', 0] },
          NumarAnunturi: 1
        }
      }
    ]);
    
    console.log('Statistics aggregated for', statistics.length, 'zones');
    
    // Convert statistics array to object for easier lookup
    const statsMap = {};
    statistics.forEach(stat => {
      statsMap[stat.zone] = stat;
    });
    
    // Merge statistics into GeoJSON properties
    geojson.features = geojson.features.map(feature => {
      const zoneName = feature.properties.text;
      const zoneStats = statsMap[zoneName] || {};
      
      return {
        ...feature,
        properties: {
          ...feature.properties,
          ...zoneStats
        }
      };
    });
    
    res.json(geojson);
  } catch (err) {
    console.error('Error handling map data:', err);
    res.status(500).json({ 
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
  }
});

module.exports = router;