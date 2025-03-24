const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
    const result = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').find();
    result.toArray().then((authors) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(authors);
    });
};

const getSingle = async (req, res) => {
    const authorId = new ObjectId(req.params.id);
    const result = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').find({ _id: authorId });
    result.toArray().then((authors) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(authors[0]);
    });
};

module.exports = {
    getAll,
    getSingle
};