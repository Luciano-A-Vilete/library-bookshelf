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

const createBook = async (req, res) => {
    const book = {
        title: req.body.title,
        author: req.body.author,
        publisher: req.body.publisher,
        category: req.body.category,
        totalPages: req.body.totalPages
    };
    const response = await mongodb.getDatabase().db().collection('Books').insertOne(book);
    if (response.modifiedCount > 0) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error occurred while creating a book');
    }
};

const updateBook = async (req, res) => {
    const bookId = new ObjectId(req.params.id);
    const book = {
        title: req.body.title,
        author: req.body.author,
        publisher: req.body.publisher,
        category: req.body.category,
        totalPages: req.body.totalPages
    };
    const response = await mongodb.getDatabase().db().collection('Books').replaceOne({ _id: bookId }, book);
    if (response.modifiedCount > 0) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error occurred while updating a book');
    }
};

const deleteBook = async (req, res) => {
    const bookId = new ObjectId(req.params.id);
    const response = await mongodb.getDatabase().db().collection('Books').remove({ _id: bookId }, true);
    if (response.deletedCount > 0) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error occurred while deleting a book');
    }
};

module.exports = {
    getAll,
    getSingle,
    createBook,
    updateBook,
    deleteBook
};