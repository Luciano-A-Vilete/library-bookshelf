const dotenv = require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;

let database;

const initDb = (callback) => {
    if (database) {
        console.log('Database is initialized');
        return callback(null, database);
    }
    MongoClient.connect(process.env.MONGODB_URI).then((client) => {
        database = client;
        callback(null, database);
    })
    .catch((error) =>{
        callback(error);
    })
};

const getDatabase = () => {
    if (!database) {
        throw Error('Dtabase not initialized');
    }
    return database;
};

module.exports = {
    initDb,
    getDatabase
}