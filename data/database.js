// data/database.js

// Load environment variables from the .env file
const dotenv = require('dotenv').config();
const { MongoClient } = require('mongodb');

let database; // Variable to store the initialized database instance

const initDb = (callback) => {
  // If the database is already initialized, return it via callback
  if (database) {
    console.log('Database is already initialized');
    return callback(null, database);
  }
  // Connect to MongoDB using the URI from environment variables
  MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true })
    .then((client) => {
      // Specify the database name (e.g., "Reading-Tracker") you want to use
      database = client.db('Reading-Tracker');
      console.log('Successfully connected to database: Reading-Tracker');
      callback(null, database);
    })
    .catch((error) => {
      callback(error);
    });
};

const getDatabase = () => {
  if (!database) {
    throw new Error('Database not initialized');
  }
  return database;
};

module.exports = {
  initDb,
  getDatabase
};
