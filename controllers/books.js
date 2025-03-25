const { check, validationResult } = require('express-validator');
const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

// Get all books
const getAllBooks = async (req, res, next) => {
    try {
        console.log('Fetching all books...');
        const result = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').find();
        const books = await result.toArray();
        console.log('Books fetched:', books);
        res.status(200).json(books);
    } catch (err) {
        console.error('Error fetching books:', err);
        next(err);
    }
};

// Get a single book
const getSingleBook = async (req, res, next) => {
    try {
        const bookId = new ObjectId(req.params.id);
        console.log('Fetching book with ID:', bookId);
        const result = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').find({ _id: bookId });
        const books = await result.toArray();
        if (!books[0]) {
            return res.status(404).json({ error: 'Book not found.' });
        }
        console.log('Book fetched:', books[0]);
        res.status(200).json(books[0]);
    } catch (err) {
        console.error('Error fetching book:', err);
        next(err);
    }
};

// Create a new book
const createBook = [
    // Validation rules
    check('title').notEmpty().withMessage('Title is required'),
    check('author').notEmpty().withMessage('Author is required'),
    check('publisher').notEmpty().withMessage('Publisher is required'),
    check('category').notEmpty().withMessage('Category is required'),
    check('totalPages').isInt({ gt: 0 }).withMessage('Total pages must be a positive integer'),

    // Handler
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const book = {
                title: req.body.title,
                author: req.body.author,
                publisher: req.body.publisher,
                category: req.body.category,
                totalPages: req.body.totalPages,
            };
            console.log('Book to be created:', book);
            const response = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').insertOne(book);
            if (response.insertedId) {
                res.status(201).json({ message: 'Book created successfully.' });
            } else {
                throw new Error('Failed to create book.');
            }
        } catch (err) {
            console.error('Error creating book:', err);
            next(err);
        }
    }
];

// Update a book
const updateBook = [
    // Validation rules
    check('title').notEmpty().withMessage('Title is required'),
    check('author').notEmpty().withMessage('Author is required'),
    check('publisher').notEmpty().withMessage('Publisher is required'),
    check('category').notEmpty().withMessage('Category is required'),
    check('totalPages').isInt({ gt: 0 }).withMessage('Total pages must be a positive integer'),

    // Handler
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const bookId = new ObjectId(req.params.id);
            const book = {
                title: req.body.title,
                author: req.body.author,
                publisher: req.body.publisher,
                category: req.body.category,
                totalPages: req.body.totalPages,
            };
            console.log('Updating book with ID:', bookId);
            const response = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').replaceOne({ _id: bookId }, book);
            if (response.modifiedCount > 0) {
                res.status(204).send();
            } else {
                throw new Error('Book not updated.');
            }
        } catch (err) {
            console.error('Error updating book:', err);
            next(err);
        }
    }
];

// Delete a book
const deleteBook = async (req, res, next) => {
    try {
        const bookId = new ObjectId(req.params.id);
        console.log('Deleting book with ID:', bookId);
        const response = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').deleteOne({ _id: bookId });
        if (response.deletedCount > 0) {
            res.status(204).send();
        } else {
            return res.status(404).json({ error: 'Book not found.' });
        }
    } catch (err) {
        console.error('Error deleting book:', err);
        next(err);
    }
};

module.exports = {
    getAllBooks,
    getSingleBook,
    createBook,
    updateBook,
    deleteBook
}