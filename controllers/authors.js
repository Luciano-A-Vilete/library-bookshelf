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

const createAuthor = async (req, res) => {
    const author = {
        name: req.body.name,
        books: req.body.books
        };
    const response = await mongodb.getDatabase().db().collection('Authors').insertOne(author);
    if (response.insertedId > 0) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error occurred while creating an author');
    }
};

const updateAuthor = async (req, res) => {
    const authorId = new ObjectId(req.params.id);
    const author = {
        name: req.body.name,
        books: req.body.books
        };
    const response = await mongodb.getDatabase().db().collection('Authors').replaceOne({ _id: authorId }, author);
    if (response.matchedCount > 0) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error occurred while updating an author');
    }
};

const deleteAuthor = async (req, res) => {
    const authorId = new ObjectId(req.params.id);
    const response = await mongodb.getDatabase().db().collection('Authors').deleteOne({ _id: authorId }, true);
    if (response.deletedCount > 0) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error occurred while deleting an author');
    }
};

module.exports = {
    getAll,
    getSingle,
    createAuthor,
    updateAuthor,
    deleteAuthor
};