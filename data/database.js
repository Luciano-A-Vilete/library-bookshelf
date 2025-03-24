const dotenv = require('dotenv');
dotenv.config();

const { MongoClient } = require('mongodb');

let database;

const initDb = async (callback) => {
    if (database) {
        console.log('Database is already initialized!');
        return callback(null, database);
    }

    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        database = client.db(); // Aqui pegamos a referência ao banco de dados corretamente
        console.log("Banco de dados conectado!");
        callback(null, database);
    } catch (err) {
        console.error("Erro ao conectar ao banco:", err);
        callback(err);
    }
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
