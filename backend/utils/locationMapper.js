// utils/locationMapper.js
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

  // Zona Lipovei (including Calea Sever Bocu and Calea Buziasului)
  'lipovei': 'Timisoara, zona Lipovei',
  'lipova': 'Timisoara, zona Lipovei',
  'calea sever bocu': 'Timisoara, zona Lipovei',
  'calea buziasului': 'Timisoara, zona Lipovei',

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

  // Zona Fabric (including Calea Sagului, Padurea Verde)
  'fabric': 'Timisoara, zona Fabric',
  'calea sagului': 'Timisoara, zona Fabric',
  'padurea verde': 'Timisoara, zona Fabric',

  // Zona Complex Studentesc
  'student': 'Timisoara, zona Complex Studentesc',
  'studentesc': 'Timisoara, zona Complex Studentesc',
  'campus': 'Timisoara, zona Complex Studentesc',
  'complex': 'Timisoara, zona Complex Studentesc',
  'lunei': 'Timisoara, zona Complex Studentesc',
  'mehala': 'Timisoara, zona Complex Studentesc',
  'mosnita noua': 'Timisoara, zona Complex Studentesc'
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
  
  // If no keyword matches, default to 'Unknown'
  return 'Unknown';
}

/**
 * Update all rentals in the database with mapped zone information.
 * This update function will now map as many listings as possible into one of the 11 defined zones.
 */
async function updateAllRentalsWithZones() {
  try {
    // Find rentals that have not yet been mapped (or have an 'Unknown' mapped_zone)
    const rentals = await Rental.find({ $or: [ { mapped_zone: { $exists: false } }, { mapped_zone: 'Unknown' } ] });
    console.log(`Found ${rentals.length} rentals to update with zone mapping`);
    
    let updatedCount = 0;
    
    for (const rental of rentals) {
      const mappedZone = mapLocationToZone(rental.location);
      
      // Only update if the mapping is not 'Unknown'
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
