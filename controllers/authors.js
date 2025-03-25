const { check, validationResult } = require('express-validator');
const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAllAuthors = async (req, res, next) => {
    try {
        console.log('Fetching all authors...');
        const result = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').find();
        const authors = await result.toArray();
        console.log('Authors fetched:', authors);
        res.status(200).json(authors);
    } catch (err) {
        console.error('Error fetching authors:', err);
        next(err);
    }
};

const getSingleAuthor = async (req, res, next) => {
    try {
        const authorId = new ObjectId(req.params.id);
        console.log('Fetching author with ID:', authorId);
        const result = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').find({ _id: authorId });
        const authors = await result.toArray();
        if (!authors[0]) {
            return res.status(404).json({ error: 'Author not found.' });
        }
        console.log('Author fetched:', authors[0]);
        res.status(200).json(authors[0]);
    } catch (err) {
        console.error('Error fetching author:', err);
        next(err);
    }
};

const createAuthor = [
    // Validation rules
    check('name').notEmpty().withMessage('Name is required'),
    check('books').isArray().withMessage('Books must be an array'),

    // Handler
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const author = {
                name: req.body.name,
                books: req.body.books,
            };
            console.log('Author to be created:', author);
            const response = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').insertOne(author);
            if (response.insertedId) {
                res.status(201).json({ message: 'Author created successfully.' });
            } else {
                throw new Error('Failed to create author.');
            }
        } catch (err) {
            console.error('Error creating author:', err);
            next(err);
        }
    }
];

const updateAuthor = [
    // Validation rules
    check('name').notEmpty().withMessage('Name is required'),
    check('books').isArray().withMessage('Books must be an array'),

    // Handler
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const authorId = new ObjectId(req.params.id);
            const author = {
                name: req.body.name,
                books: req.body.books,
            };
            console.log('Updating author with ID:', authorId);
            const response = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').replaceOne({ _id: authorId }, author);
            if (response.modifiedCount > 0) {
                res.status(204).send();
            } else {
                throw new Error('Author not updated.');
            }
        } catch (err) {
            console.error('Error updating author:', err);
            next(err);
        }
    }
];

const deleteAuthor = async (req, res, next) => {
    try {
        const authorId = new ObjectId(req.params.id);
        console.log('Deleting author with ID:', authorId);
        const response = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').deleteOne({ _id: authorId });
        if (response.deletedCount > 0) {
            res.status(204).send();
        } else {
            return res.status(404).json({ error: 'Author not found.' });
        }
    } catch (err) {
        console.error('Error deleting author:', err);
        next(err);
    }
};

module.exports = {
    getAllAuthors,
    getSingleAuthor,
    createAuthor,
    updateAuthor,
    deleteAuthor
};