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
            const { title, author, publisher, category, totalPages } = req.body;

            // Create the book object
            const book = { title, author, publisher, category, totalPages };

            // Insert the book into the books collection
            const bookResponse = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').insertOne(book);
            console.log('Book created:', bookResponse);

            // Check if the author exists in the authors collection
            const authorResponse = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').findOne({ name: author });
            if (authorResponse) {
                // Update the books field for the author
                const updateResponse = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').updateOne(
                    { name: author },
                    { $push: { books: title } }
                );
                console.log('Author updated with new book:', updateResponse);
            } else {
                // Author doesn't exist, create a new author entry
                const newAuthor = {
                    name: author,
                    books: [title]
                };
                const newAuthorResponse = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').insertOne(newAuthor);
                console.log('New author created:', newAuthorResponse);
            }

            res.status(201).json({ message: 'Book created and author updated dynamically.' });
        } catch (err) {
            console.error('Error creating book dynamically:', err);
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
            const { title, author, publisher, category, totalPages } = req.body;

            // Fetch the existing book
            const existingBook = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').findOne({ _id: bookId });
            if (!existingBook) {
                return res.status(404).json({ error: 'Book not found.' });
            }

            // Update the book
            const updateResponse = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').updateOne(
                { _id: bookId },
                { $set: { title, author, publisher, category, totalPages } }
            );
            console.log('Book updated:', updateResponse);

            // If the author changes, update the authors collection
            if (existingBook.author !== author) {
                // Remove the book from the previous author's books array
                await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').updateOne(
                    { name: existingBook.author },
                    { $pull: { books: existingBook.title } }
                );

                // Add the book to the new author's books array
                await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').updateOne(
                    { name: author },
                    { $push: { books: title } },
                    { upsert: true }
                );
            }

            res.status(200).json({ message: 'Book updated dynamically.' });
        } catch (err) {
            console.error('Error updating book dynamically:', err);
            next(err);
        }
    }
];

// Delete a book
const deleteBook = async (req, res, next) => {
    try {
        const bookId = new ObjectId(req.params.id);

        // Fetch the book to be deleted
        const book = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').findOne({ _id: bookId });
        if (!book) {
            return res.status(404).json({ error: 'Book not found.' });
        }

        // Delete the book
        const deleteResponse = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').deleteOne({ _id: bookId });
        console.log('Book deleted:', deleteResponse);

        // Remove the book from the author's books array
        const authorUpdateResponse = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').updateOne(
            { name: book.author },
            { $pull: { books: book.title } }
        );
        console.log('Author updated after book deletion:', authorUpdateResponse);

        res.status(204).send();
    } catch (err) {
        console.error('Error deleting book dynamically:', err);
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