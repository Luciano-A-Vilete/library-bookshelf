// data/database.js

// Load environment variables from the .env file
const dotenv = require('dotenv').config();
const { MongoClient } = require('mongodb');

let dbInstance; // Variable to store the initialized database instance

// Function to initialize the database connection
const initDb = async (callback) => {
  // If the database is already initialized, return it via callback
  if (dbInstance) {
    console.log('Database is already initialized');
    return callback(null, dbInstance);
  }
  try {
    // Connect to MongoDB using the URI from environment variables
    const client = await MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true });
    // Get the default database specified in the URI
    dbInstance = client.db();
    console.log('Successfully connected to MongoDB');
    return callback(null, dbInstance);
  } catch (error) {
    // Return the error via callback if the connection fails
    return callback(error);
  }
};

// Function to retrieve the initialized database instance
const getDatabase = () => {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }
  return dbInstance;
};

module.exports = {
  initDb,
  getDatabase
};
