// scripts/mapLocations.js
const mongoose = require('mongoose');
const locationMapper = require('../utils/locationMapper');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/storia', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected');
  
  // Run the mapping process
  locationMapper.updateAllRentalsWithZones()
    .then(() => {
      console.log('Zone mapping process completed');
      mongoose.disconnect();
    });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});