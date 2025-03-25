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
            const { name, books } = req.body;

            // Create the author object
            const author = { name, books };

            // Insert the author into the authors collection
            const authorResponse = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').insertOne(author);
            console.log('Author created:', authorResponse);

            // Insert each book into the books collection
            const bookPromises = books.map(async (title) => {
                const book = { title, author: name };
                const bookResponse = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').updateOne(
                    { title },
                    { $set: book },
                    { upsert: true } // Create the book if it doesn't exist
                );
                console.log('Book added dynamically:', bookResponse);
            });
            await Promise.all(bookPromises); // Ensure all books are added

            res.status(201).json({ message: 'Author created and books added dynamically.' });
        } catch (err) {
            console.error('Error creating author dynamically:', err);
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
            const { name, books } = req.body;

            // Fetch the existing author
            const existingAuthor = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').findOne({ _id: authorId });
            if (!existingAuthor) {
                return res.status(404).json({ error: 'Author not found.' });
            }

            // Update the author
            const updateResponse = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').updateOne(
                { _id: authorId },
                { $set: { name, books } }
            );
            console.log('Author updated:', updateResponse);

            // Synchronize books collection
            const booksToRemove = existingAuthor.books.filter((book) => !books.includes(book));
            const booksToAdd = books.filter((book) => !existingAuthor.books.includes(book));

            // Remove books no longer associated with the author
            const removeOldBooksPromises = booksToRemove.map(async (title) => {
                const response = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').deleteOne({ title, author: existingAuthor.name });
                console.log('Book removed dynamically:', response);
            });
            await Promise.all(removeOldBooksPromises);

            // Add new books to the books collection
            const addNewBooksPromises = booksToAdd.map(async (title) => {
                const book = { title, author: name };
                const response = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').updateOne(
                    { title },
                    { $set: book },
                    { upsert: true }
                );
                console.log('Book added dynamically:', response);
            });
            await Promise.all(addNewBooksPromises);

            res.status(200).json({ message: 'Author updated dynamically.' });
        } catch (err) {
            console.error('Error updating author dynamically:', err);
            next(err);
        }
    }
];

const deleteAuthor = async (req, res, next) => {
    try {
        const authorId = new ObjectId(req.params.id);

        // Fetch the author to be deleted
        const author = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').findOne({ _id: authorId });
        if (!author) {
            return res.status(404).json({ error: 'Author not found.' });
        }

        // Delete the author
        const deleteResponse = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').deleteOne({ _id: authorId });
        console.log('Author deleted:', deleteResponse);

        // Remove all books associated with the author
        const bookDeleteResponse = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').deleteMany({ author: author.name });
        console.log('Books removed after author deletion:', bookDeleteResponse);

        res.status(204).send();
    } catch (err) {
        console.error('Error deleting author dynamically:', err);
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