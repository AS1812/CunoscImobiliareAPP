// scripts/mapLocations.js - Enhanced to handle all documents
const mongoose = require('mongoose');
const locationMapper = require('../utils/locationMapper');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    console.log(`Attempting to connect to MongoDB at ${MONGO_URI.substring(0, 20)}...`);
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Main function to run the mapping process
const runMappingProcess = async () => {
  try {
    // Connect to the database
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to the database. Exiting...');
      process.exit(1);
    }
    
    console.log('Starting zone mapping process...');
    
    // Run the mapping process with progress reporting
    const result = await locationMapper.updateAllRentalsWithZones(true);
    
    console.log('--------- Mapping Process Summary ---------');
    console.log(`Total documents processed: ${result.totalDocuments}`);
    console.log(`Documents mapped successfully: ${result.updatedCount}`);
    console.log(`Documents that remain unmapped: ${result.unmappedCount}`);
    console.log(`Percentage mapped: ${((result.updatedCount / result.totalDocuments) * 100).toFixed(2)}%`);
    console.log('-------------------------------------------');
    
    // List of zones with counts
    console.log('\nZone distribution:');
    result.zoneCounts.forEach(zone => {
      console.log(`${zone._id}: ${zone.count} listings`);
    });
    
    console.log('\nZone mapping process completed');
    
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error during mapping process:', error);
    process.exit(1);
  }
};

// Run the process
runMappingProcess();