const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
    //swagger.tags=['Books']
    try {
        console.log('Fetching all books...'); // Log when the function is triggered
        const result = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').find();
        const books = await result.toArray();
        console.log('Books fetched:', books); // Log the books retrieved
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(books);
    } catch (err) {
        console.error('Error fetching books:', err); // Log errors if they occur
        res.status(500).json({ error: 'Failed to fetch books.' });
    }
};



const getSingle = async (req, res) => {
    //swagger.tags=['Books']
    try {
        const bookId = new ObjectId(req.params.id);
        console.log('Fetching book with ID:', bookId); // Log the book ID being fetched
        const result = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').find({ _id: bookId });
        const books = await result.toArray();
        console.log('Book fetched:', books[0]); // Log the specific book retrieved
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(books[0]);
    } catch (err) {
        console.error('Error fetching book:', err); // Log errors if they occur
        res.status(500).json({ error: 'Failed to fetch book.' });
    }
};



const createBook = async (req, res) => {
    //swagger.tags=['Books']
    try {
        console.log('Request body:', req.body); // Log the incoming request data
        const book = {
            title: req.body.title,
            author: req.body.author,
            publisher: req.body.publisher,
            category: req.body.category,
            totalPages: req.body.totalPages
        };
        console.log('Book to be created:', book); // Log the book object to be inserted
        const response = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').insertOne(book);
        console.log('MongoDB response:', response); // Log the response from MongoDB
        if (response.insertedId) {
            res.status(201).send(); // Status 201 for successful creation
        } else {
            throw new Error('Failed to insert book');
        }
    } catch (err) {
        console.error('Error creating book:', err); // Log errors
        res.status(500).json({ error: 'Failed to create book.' });
    }
};



const updateBook = async (req, res) => {
    //swagger.tags=['Books']
    try {
        const bookId = new ObjectId(req.params.id);
        console.log('Updating book with ID:', bookId); // Log the book ID being updated
        console.log('Request body:', req.body); // Log the incoming request data
        const book = {
            title: req.body.title,
            author: req.body.author,
            publisher: req.body.publisher,
            category: req.body.category,
            totalPages: req.body.totalPages
        };
        console.log('Book to update:', book); // Log the updated book data
        const response = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').replaceOne({ _id: bookId }, book);
        console.log('MongoDB response:', response); // Log the response from MongoDB
        if (response.modifiedCount > 0) {
            res.status(204).send(); // Status 204 for successful update
        } else {
            throw new Error('No records were updated');
        }
    } catch (err) {
        console.error('Error updating book:', err); // Log errors
        res.status(500).json({ error: 'Failed to update book.' });
    }
};



const deleteBook = async (req, res) => {
    //swagger.tags=['Books']
    try {
        const bookId = new ObjectId(req.params.id);
        console.log('Deleting book with ID:', bookId); // Log the book ID being deleted
        const response = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').deleteOne({ _id: bookId });
        console.log('MongoDB response:', response); // Log the response from MongoDB
        if (response.deletedCount > 0) {
            res.status(204).send(); // Status 204 for successful deletion
        } else {
            throw new Error('No records were deleted');
        }
    } catch (err) {
        console.error('Error deleting book:', err); // Log errors
        res.status(500).json({ error: 'Failed to delete book.' });
    }
};


module.exports = {
    getAll,
    getSingle,
    createBook,
    updateBook,
    deleteBook
};