// routes/rentals.js - Simplified for reliability and NO estimated data
const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const fs = require('fs').promises;
const path = require('path');

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const count = await Rental.countDocuments();
    console.log(`Health check: Database connected, found ${count} documents`);
    res.json({ status: 'ok', count });
  } catch (err) {
    console.error('Database health check failed:', err);
    res.status(500).json({ error: 'Database health check failed' });
  }
});

// Basic stats endpoint - extremely simplified for reliability
router.get('/stats/:rooms', async (req, res) => {
  try {
    const { rooms } = req.params;
    const sanitizedRooms = rooms.replace(/[^0-9]/g, '');
    
    console.log(`Fetching statistics for ${sanitizedRooms} room(s)`);
    
    // Simple find query to verify we have matching records
    const matchingCount = await Rental.countDocuments({
      'details.rooms': { $regex: new RegExp(`^${sanitizedRooms}( |$)`, 'i') }
    });
    
    console.log(`Found ${matchingCount} matching documents for rooms: ${sanitizedRooms}`);
    
    if (matchingCount === 0) {
      // No matching records, return explicit empty array
      return res.json([]);
    }
    
    // Get sample data with lean() for memory efficiency
    const sampleData = await Rental.find({
      'details.rooms': { $regex: new RegExp(`^${sanitizedRooms}( |$)`, 'i') }
    })
    .limit(1000)  // Increase limit for better coverage
    .lean();
    
    console.log(`Retrieved ${sampleData.length} sample documents for processing`);
    
    // Group data by zone manually
    const zoneGroups = {};
    
    sampleData.forEach(rental => {
      const zone = rental.mapped_zone || 'Unknown';
      
      if (!zoneGroups[zone]) {
        zoneGroups[zone] = {
          prices: [],
          areas: [],
          count: 0
        };
      }
      
      // Parse price
      if (rental.price && rental.price.amount) {
        const price = parseFloat(rental.price.amount);
        if (!isNaN(price) && price > 0) {
          zoneGroups[zone].prices.push(price);
        }
      }
      
      // Parse area
      if (rental.details && rental.details.area) {
        const areaMatch = rental.details.area.match(/^(\d+)/);
        if (areaMatch) {
          const area = parseFloat(areaMatch[1]);
          if (!isNaN(area) && area > 0) {
            zoneGroups[zone].areas.push(area);
          }
        }
      }
      
      zoneGroups[zone].count++;
    });
    
    // Calculate statistics for each zone
    const zoneStats = Object.keys(zoneGroups).map(zone => {
      const group = zoneGroups[zone];
      
      // Calculate price statistics
      const avgPrice = group.prices.length > 0 
        ? Math.round(group.prices.reduce((sum, price) => sum + price, 0) / group.prices.length) 
        : 0;
        
      const minPrice = group.prices.length > 0 
        ? Math.round(Math.min(...group.prices)) 
        : 0;
        
      const maxPrice = group.prices.length > 0 
        ? Math.round(Math.max(...group.prices)) 
        : 0;
      
      // Calculate area statistics
      const avgArea = group.areas.length > 0 
        ? Math.round(group.areas.reduce((sum, area) => sum + area, 0) / group.areas.length) 
        : 0; 
      
      // Calculate price per square meter
      const pricePerSqm = (avgPrice > 0 && avgArea > 0) 
        ? Math.round(avgPrice / avgArea) 
        : 0;
      
      return {
        ZonăApartament: zone,
        PretMediu: avgPrice,
        PretMinim: minPrice,
        PretMaxim: maxPrice,
        MetriPartrati_InMedie: avgArea,
        PretMediu_MetruPatrat: pricePerSqm,
        NumarAnunturi: group.count
      };
    });
    
    // Sort by number of listings
    const sortedStats = zoneStats.sort((a, b) => b.NumarAnunturi - a.NumarAnunturi);
    console.log(`Generated statistics for ${sortedStats.length} zones`);
    
    res.json(sortedStats);
  } catch (err) {
    console.error('Error in statistics:', err);
    res.status(500).json({ error: 'Statistics generation failed', details: err.message });
  }
});

// Map data endpoint
router.get('/map', async (req, res) => {
  try {
    // Load the GeoJSON file
    const geojsonPath = path.join(__dirname, '../map.geojson');
    let geojsonData;
    
    try {
      geojsonData = await fs.readFile(geojsonPath, 'utf8');
    } catch (fsError) {
      // Try alternate location
      const alternateGeojsonPath = path.join(process.cwd(), 'map.geojson');
      geojsonData = await fs.readFile(alternateGeojsonPath, 'utf8');
    }
    
    const geojson = JSON.parse(geojsonData);
    
    // Get basic zone counts - very simple query
    const zoneCounts = await Rental.aggregate([
      {
        $group: {
          _id: '$mapped_zone',
          count: { $sum: 1 },
          avgPrice: { 
            $avg: { 
              $convert: { 
                input: '$price.amount', 
                to: 'double', 
                onError: 0, 
                onNull: 0 
              } 
            } 
          }
        }
      },
      {
        $project: {
          _id: 0,
          zone: { $ifNull: ['$_id', 'Unknown'] },
          count: 1,
          avgPrice: { $round: ['$avgPrice', 0] }
        }
      }
    ]);
    
    // Create a lookup object
    const statsLookup = {};
    zoneCounts.forEach(stat => {
      if (stat.zone) {
        statsLookup[stat.zone] = stat;
      }
    });
    
    // Enhance the GeoJSON with statistics
    if (geojson.features && geojson.features.length) {
      geojson.features = geojson.features.map(feature => {
        const zoneName = feature.properties.text;
        const zoneStats = statsLookup[zoneName] || { count: 0, avgPrice: 0 };
        
        return {
          ...feature,
          properties: {
            ...feature.properties,
            statistics: zoneStats
          }
        };
      });
    }
    
    console.log(`Enhanced map with statistics for ${zoneCounts.length} zones`);
    res.json(geojson);
  } catch (err) {
    console.error('Error in map data:', err);
    res.status(500).json({ error: 'Map data generation failed', details: err.message });
  }
});

// Static map endpoint 
router.get('/map-static', async (req, res) => {
  try {
    // Try multiple paths
    const possiblePaths = [
      path.join(__dirname, '../map.geojson'),
      path.join(process.cwd(), 'map.geojson'),
      './map.geojson'
    ];
    
    let geojsonData = null;
    
    for (const filePath of possiblePaths) {
      try {
        console.log(`Trying to read map from: ${filePath}`);
        geojsonData = await fs.readFile(filePath, 'utf8');
        console.log(`Successfully read map from: ${filePath}`);
        break;
      } catch (err) {
        console.log(`Failed to read from ${filePath}`);
      }
    }
    
    if (!geojsonData) {
      return res.status(404).json({ error: 'Map file not found' });
    }
    
    res.json(JSON.parse(geojsonData));
  } catch (err) {
    console.error('Error serving static map data:', err);
    res.status(500).json({ error: 'Static map data failed', details: err.message });
  }
});

// Database stats
router.get('/database-stats', async (req, res) => {
  try {
    // Get total number of documents
    const totalListings = await Rental.countDocuments();
    
    // Get number of documents per room type - simple version
    const roomCounts = await Rental.aggregate([
      {
        $group: {
          _id: '$details.rooms',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get number of documents per zone - simple version
    const zoneDistribution = await Rental.aggregate([
      {
        $group: {
          _id: '$mapped_zone',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalListings,
      roomDistribution: roomCounts,
      zoneDistribution,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error fetching database stats:', err);
    res.status(500).json({ error: 'Database stats failed', details: err.message });
  }
});

module.exports = router;