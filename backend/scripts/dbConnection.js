// database-connection-monitor.js
// Save this as a separate file and run it with: node database-connection-monitor.js
const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://andreinicula:EKbhEmsOalYFOiPc@rentalcluster.0k9kq.mongodb.net/rentals?retryWrites=true&w=majority&appName=RentalCluster';

// Create a schema that matches your rental model
const rentalSchema = new mongoose.Schema({
  listing_id: String,
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
  mapped_zone: String
}, { 
  collection: 'timisoara',
  strict: false // Allow flexible schema for diagnosis
});

// Create the model
const Rental = mongoose.model('Rental', rentalSchema);

async function testDatabaseConnection() {
  console.log('Starting database connection test...');
  console.log(`Using connection string: ${MONGO_URI.replace(/:[^:]*@/, ':****@')}`);
  
  try {
    // Connect with detailed logging
    await mongoose.connect(MONGO_URI);
    
    const db = mongoose.connection;
    console.log('\n==== CONNECTION INFO ====');
    console.log(`Connected to MongoDB: ${db.host}:${db.port}/${db.name}`);
    console.log(`Connection state: ${mongoose.connection.readyState}`);
    console.log(`Connection options:`, JSON.stringify(db.options, null, 2));
    
    // Get collection stats
    const collections = await db.db.listCollections().toArray();
    console.log('\n==== COLLECTIONS ====');
    console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    const timisoaraExists = collections.some(c => c.name === 'timisoara');
    console.log(`'timisoara' collection exists: ${timisoaraExists}`);
    
    if (timisoaraExists) {
      const stats = await db.db.collection('timisoara').stats();
      console.log(`Collection stats for 'timisoara':`);
      console.log(`- Document count: ${stats.count}`);
      console.log(`- Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    }
    
    // Test basic queries
    console.log('\n==== QUERY TESTS ====');
    
    // 1. Basic count
    const totalCount = await Rental.countDocuments();
    console.log(`Total documents: ${totalCount}`);
    
    // 2. Find first document
    const firstDoc = await Rental.findOne();
    if (firstDoc) {
      console.log('Sample document structure:');
      console.log(JSON.stringify(firstDoc.toObject(), null, 2));
    } else {
      console.log('No documents found in collection');
    }
    
    // 3. Test room queries - different patterns
    console.log('\n==== ROOM QUERY TESTS ====');
    
    // Get distribution of room values
    const distinctRooms = await Rental.distinct('details.rooms');
    console.log(`Distinct room values: ${JSON.stringify(distinctRooms)}`);
    
    // Test various query patterns for 2 rooms
    const queryTests = [
      { name: 'Exact match "2"', query: { 'details.rooms': '2' } },
      { name: 'Contains "2"', query: { 'details.rooms': { $regex: '2', $options: 'i' } } },
      { name: 'Starts with "2"', query: { 'details.rooms': { $regex: /^2/, $options: 'i' } } },
      { name: 'Starts with "2" followed by space or end', query: { 'details.rooms': { $regex: /^2( |$)/, $options: 'i' } } },
      { name: 'Equals 2 (numeric)', query: { 'details.rooms': 2 } },
      { name: 'Contains "2 camere"', query: { 'details.rooms': { $regex: '2 camere', $options: 'i' } } },
    ];
    
    for (const test of queryTests) {
      const count = await Rental.countDocuments(test.query);
      console.log(`${test.name}: ${count} documents`);
      
      if (count > 0) {
        const sample = await Rental.findOne(test.query);
        console.log(`  Sample matching document: details.rooms = "${sample.details.rooms}"`);
      }
    }
    
    // Close connection
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('\n==== CONNECTION ERROR ====');
    console.error(error);
  }
}

// Run the test
testDatabaseConnection();