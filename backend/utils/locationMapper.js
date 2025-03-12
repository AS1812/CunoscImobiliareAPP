// utils/locationMapper.js - Enhanced with better mapping and reporting
const Rental = require('../models/Rental');
const fs = require('fs').promises;
const path = require('path');

// Extended map of common location keywords to one of the 11 GeoJSON zones
const zoneKeywords = {
  // Zona Cetatii (historical center)
  'cetate': 'Timisoara, zona Cetatii',
  'cetatea': 'Timisoara, zona Cetatii',
  'cetatii': 'Timisoara, zona Cetatii',
  'bulevardul mihai eminescu': 'Timisoara, zona Cetatii',
  'stadion': 'Timisoara, zona Cetatii',
  'centru': 'Timisoara, zona Cetatii',
  'central': 'Timisoara, zona Cetatii',
  'unirii': 'Timisoara, zona Cetatii',
  'libertatii': 'Timisoara, zona Cetatii',
  'victoriei': 'Timisoara, zona Cetatii',

  // Zona Telegrafului
  'telegraf': 'Timisoara, zona Telegrafului',
  'telegrafului': 'Timisoara, zona Telegrafului',

  // Zona Dorobantilor (also covering Circumvalatiunii, Odobescu, Fratelia, Dambovita, Steaua, Bucovina, Zona Soarelui)
  'dorobant': 'Timisoara, zona Dorobantilor',
  'dorobantilor': 'Timisoara, zona Dorobantilor',
  'circumval': 'Timisoara, zona Dorobantilor',
  'odobescu': 'Timisoara, zona Dorobantilor',
  'fratelia': 'Timisoara, zona Dorobantilor',
  'dambovit': 'Timisoara, zona Dorobantilor',
  'steaua': 'Timisoara, zona Dorobantilor',
  'bucovin': 'Timisoara, zona Dorobantilor',
  'zona soarelui': 'Timisoara, zona Dorobantilor',
  'soarelui': 'Timisoara, zona Dorobantilor',

  // Zona Lipovei (including Calea Sever Bocu and Calea Buziasului)
  'lipovei': 'Timisoara, zona Lipovei',
  'lipova': 'Timisoara, zona Lipovei',
  'calea sever bocu': 'Timisoara, zona Lipovei',
  'sever bocu': 'Timisoara, zona Lipovei',
  'calea buziasului': 'Timisoara, zona Lipovei',
  'buziasului': 'Timisoara, zona Lipovei',

  // Zona Aradului
  'arad': 'Timisoara, zona Aradului',
  'aradului': 'Timisoara, zona Aradului',
  'kogalnic': 'Timisoara, zona Aradului', // covers Kogalniceanu
  'badea cartan': 'Timisoara, zona Aradului',

  // Zona Elisabetin
  'elisabet': 'Timisoara, zona Elisabetin',
  'elisabetin': 'Timisoara, zona Elisabetin',

  // Zona Iosefin (including Calea Girocului, Tipografilor, Crisan, Ciarda Rosie, Giroc)
  'iosefin': 'Timisoara, zona Iosefin',
  'calea girocului': 'Timisoara, zona Iosefin',
  'girocului': 'Timisoara, zona Iosefin',
  'tipograf': 'Timisoara, zona Iosefin',
  'crisan': 'Timisoara, zona Iosefin',
  'ciarda ros': 'Timisoara, zona Iosefin',
  'giroc': 'Timisoara, zona Iosefin',

  // Zona Blascovici
  'blascovic': 'Timisoara, zona Blascovici',
  'blascovici': 'Timisoara, zona Blascovici',

  // Zona Torontalului (including Plavat)
  'torontal': 'Timisoara, zona Torontalului',
  'torontalului': 'Timisoara, zona Torontalului',
  'plavat': 'Timisoara, zona Torontalului',
  'ronat': 'Timisoara, zona Torontalului',

  // Zona Fabric (including Calea Sagului, Padurea Verde)
  'fabric': 'Timisoara, zona Fabric',
  'calea sagului': 'Timisoara, zona Fabric',
  'sagului': 'Timisoara, zona Fabric',
  'padurea verde': 'Timisoara, zona Fabric',

  // Zona Complex Studentesc
  'student': 'Timisoara, zona Complex Studentesc',
  'studentesc': 'Timisoara, zona Complex Studentesc',
  'campus': 'Timisoara, zona Complex Studentesc',
  'complex': 'Timisoara, zona Complex Studentesc',
  'lunei': 'Timisoara, zona Complex Studentesc',
  'mehala': 'Timisoara, zona Complex Studentesc',
  'mosnita noua': 'Timisoara, zona Complex Studentesc',
  'mosnita': 'Timisoara, zona Complex Studentesc',
  'universitate': 'Timisoara, zona Complex Studentesc',
  'universitar': 'Timisoara, zona Complex Studentesc',
  
  // Additional location indicators
  'braytim': 'Timisoara, zona Lipovei',
  'dacia': 'Timisoara, zona Cetatii',
  'take ionescu': 'Timisoara, zona Cetatii',
  'girodavia': 'Timisoara, zona Iosefin',
  'medicina': 'Timisoara, zona Complex Studentesc',
  'politehnica': 'Timisoara, zona Complex Studentesc',
  'plopi': 'Timisoara, zona Fabric',
  'kuncz': 'Timisoara, zona Fabric',
  'freidorf': 'Timisoara, zona Fabric',
  'balcescu': 'Timisoara, zona Fabric',
  'traian': 'Timisoara, zona Fabric',
  'simion barnutiu': 'Timisoara, zona Cetatii',
  'barnutiu': 'Timisoara, zona Cetatii',
  '3 august': 'Timisoara, zona Cetatii',
  'iosefin': 'Timisoara, zona Iosefin'
};

// Use secondary mapping for harder-to-map locations
const streetToZoneMap = {
  'str. gheorghe lazar': 'Timisoara, zona Cetatii',
  'bulevardul 16 decembrie 1989': 'Timisoara, zona Cetatii',
  'piata victoriei': 'Timisoara, zona Cetatii',
  'piata unirii': 'Timisoara, zona Cetatii',
  'bulevardul c.d. loga': 'Timisoara, zona Cetatii',
  'bulevardul vasile parvan': 'Timisoara, zona Cetatii'
  // You can add more streets as needed
};

/**
 * Map a location string to a GeoJSON zone
 * @param {string} location - The location string from MongoDB
 * @returns {string} The mapped zone name or 'Unknown'
 */
function mapLocationToZone(location) {
  if (!location) return 'Unknown';
  
  // Normalize: convert to lowercase and remove diacritics
  const normalizedLocation = location.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  // Check for each keyword match in the normalized location
  for (const [keyword, zoneName] of Object.entries(zoneKeywords)) {
    if (normalizedLocation.includes(keyword)) {
      return zoneName;
    }
  }
  
  // Try street-level mapping as a secondary check
  for (const [street, zoneName] of Object.entries(streetToZoneMap)) {
    if (normalizedLocation.includes(street)) {
      return zoneName;
    }
  }
  
  // If no keyword or street matches, default to 'Unknown'
  return 'Unknown';
}

/**
 * Update all rentals in the database with mapped zone information.
 * @param {boolean} reportProgress - Whether to log progress information
 * @returns {Promise<object>} Statistics about the update process
 */
async function updateAllRentalsWithZones(reportProgress = false) {
  try {
    // Count total documents for statistics
    const totalDocuments = await Rental.countDocuments();
    
    if (reportProgress) {
      console.log(`Found ${totalDocuments} total rental documents`);
    }
    
    // Find rentals that have not yet been mapped (or have an 'Unknown' mapped_zone)
    const rentals = await Rental.find({ 
      $or: [ 
        { mapped_zone: { $exists: false } }, 
        { mapped_zone: 'Unknown' } 
      ] 
    });
    
    if (reportProgress) {
      console.log(`Found ${rentals.length} rentals to update with zone mapping`);
    }
    
    let updatedCount = 0;
    let chunkSize = 100;
    
    // Process in chunks to avoid memory issues with large datasets
    for (let i = 0; i < rentals.length; i += chunkSize) {
      const chunk = rentals.slice(i, i + chunkSize);
      
      if (reportProgress && i > 0) {
        console.log(`Processing ${i}/${rentals.length} documents (${(i/rentals.length*100).toFixed(1)}% complete)`);
      }
      
      // Process each chunk
      const updatePromises = chunk.map(async (rental) => {
        const mappedZone = mapLocationToZone(rental.location);
        
        // Only update if the mapping is not 'Unknown'
        if (mappedZone !== 'Unknown') {
          rental.mapped_zone = mappedZone;
          await rental.save();
          return 1; // Return 1 for success
        }
        return 0; // Return 0 for no update
      });
      
      const results = await Promise.all(updatePromises);
      updatedCount += results.reduce((sum, value) => sum + value, 0);
    }
    
    // Get zone distribution after mapping
    const zoneCounts = await Rental.aggregate([
      {
        $group: {
          _id: '$mapped_zone',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Calculate the number that remain unmapped
    const unmappedCount = await Rental.countDocuments({ 
      $or: [ 
        { mapped_zone: { $exists: false } }, 
        { mapped_zone: 'Unknown' } 
      ] 
    });
    
    if (reportProgress) {
      console.log(`Updated ${updatedCount} rentals with zone mapping`);
      console.log(`${unmappedCount} rentals remain unmapped`);
    }
    
    // Return statistics about the process
    return {
      totalDocuments,
      updatedCount,
      unmappedCount,
      zoneCounts
    };
  } catch (error) {
    console.error('Error updating rentals with zones:', error);
    throw error;
  }
}

module.exports = {
  mapLocationToZone,
  updateAllRentalsWithZones
};