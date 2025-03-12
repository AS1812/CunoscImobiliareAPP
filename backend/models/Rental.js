// models/Rental.js
const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  listing_id: {
    type: String,
    required: true,
    unique: true
  },
  title: String,
  price: {
    amount: String,
    currency: String
  },
  location: String,
  details: {
    rooms: String,
    area: String,
    floor: String
  },
  description: String,
  url: String,
  scraped_at: Number,
  
  // Added field to store the mapped zone from GeoJSON
  mapped_zone: String
}, { 
  // Specify the collection name explicitly
  collection: 'timisoara' 
});

module.exports = mongoose.model('Rental', rentalSchema);