const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
    const result = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').find();
    result.toArray().then((books) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(books);
    });
};

const getSingle = async (req, res) => {
    const bookId = new ObjectId(req.params.id);
    const result = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').find({ _id: bookId });
    result.toArray().then((books) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(books[0]);
    });
};

module.exports = {
    getAll,
    getSingle
};