// utils/locationMapper.js
const Rental = require('../models/Rental');
const fs = require('fs').promises;
const path = require('path');

// Map of common location keywords to GeoJSON zones
const zoneKeywords = {
  'cetate': 'Timisoara, zona Cetatii',
  'cetatea': 'Timisoara, zona Cetatii',
  'cetatii': 'Timisoara, zona Cetatii',
  'telegraf': 'Timisoara, zona Telegrafului',
  'telegrafului': 'Timisoara, zona Telegrafului',
  'dorobanti': 'Timisoara, zona Dorobantilor',
  'dorobantilor': 'Timisoara, zona Dorobantilor',
  'lipovei': 'Timisoara, zona Lipovei',
  'lipova': 'Timisoara, zona Lipovei',
  'aradului': 'Timisoara, zona Aradului',
  'arad': 'Timisoara, zona Aradului',
  'elisabet': 'Timisoara, zona Elisabetin',
  'elisabetin': 'Timisoara, zona Elisabetin',
  'iosefin': 'Timisoara, zona Iosefin',
  'blascovici': 'Timisoara, zona Blascovici',
  'torontal': 'Timisoara, zona Torontalului',
  'torontalului': 'Timisoara, zona Torontalului',
  'fabric': 'Timisoara, zona Fabric',
  'student': 'Timisoara, zona Complex Studentesc',
  'studentesc': 'Timisoara, zona Complex Studentesc',
  'campus': 'Timisoara, zona Complex Studentesc',
  'complex': 'Timisoara, zona Complex Studentesc'
};

/**
 * Map a location string to a GeoJSON zone
 * @param {string} location - The location string from MongoDB
 * @returns {string} The mapped zone name or 'Unknown'
 */
function mapLocationToZone(location) {
  if (!location) return 'Unknown';
  
  // Convert to lowercase and remove diacritics
  const normalizedLocation = location.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  // Check for keyword matches
  for (const [keyword, zoneName] of Object.entries(zoneKeywords)) {
    if (normalizedLocation.includes(keyword)) {
      return zoneName;
    }
  }
  
  return 'Unknown';
}

/**
 * Update all rentals in the database with mapped zone information
 */
async function updateAllRentalsWithZones() {
  try {
    const rentals = await Rental.find({ mapped_zone: { $exists: false } });
    console.log(`Found ${rentals.length} rentals to update with zone mapping`);
    
    let updatedCount = 0;
    
    for (const rental of rentals) {
      const mappedZone = mapLocationToZone(rental.location);
      
      if (mappedZone !== 'Unknown') {
        rental.mapped_zone = mappedZone;
        await rental.save();
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} rentals with zone mapping`);
  } catch (error) {
    console.error('Error updating rentals with zones:', error);
  }
}

module.exports = {
  mapLocationToZone,
  updateAllRentalsWithZones
};