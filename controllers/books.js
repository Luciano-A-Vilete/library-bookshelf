const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
    console.log('Fetching all books...'); // Log when the function is triggered
    const result = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').find();
    result.toArray().then((books) => {
        console.log('Books fetched:', books); // Log the books retrieved
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(books);
    }).catch((err) => console.error('Error fetching books:', err)); // Log errors if they occur
};


const getSingle = async (req, res) => {
    const bookId = new ObjectId(req.params.id);
    console.log('Fetching book with ID:', bookId); // Log the book ID being fetched
    const result = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').find({ _id: bookId });
    result.toArray().then((books) => {
        console.log('Book fetched:', books[0]); // Log the specific book retrieved
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(books[0]);
    }).catch((err) => console.error('Error fetching book:', err)); // Log errors if they occur
};


const createBook = async (req, res) => {
    console.log('Request body:', req.body); // Log the incoming request data
    const book = {
        title: req.body.title,
        author: req.body.author,
        publisher: req.body.publisher,
        category: req.body.category,
        totalPages: req.body.totalPages
    };
    console.log('Book to be created:', book); // Log the book object to be inserted
    const response = await mongodb.getDatabase().db().collection('Books').insertOne(book);
    console.log('MongoDB response:', response); // Log the response from MongoDB
    if (response.insertedId) {
        res.status(201).send(); // Status 201 for successful creation
    } else {
        console.error('Error creating book:', response.error); // Log errors
        res.status(500).json(response.error || 'Some error occurred while creating a book');
    }
};


const updateBook = async (req, res) => {
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
    console.log('Book to update:', book); // Log the new book data
    const response = await mongodb.getDatabase().db().collection('Books').replaceOne({ _id: bookId }, book);
    console.log('MongoDB response:', response); // Log the response from MongoDB
    if (response.modifiedCount > 0) {
        res.status(204).send(); // Status 204 for successful update
    } else {
        console.error('Error updating book:', response.error); // Log errors
        res.status(500).json(response.error || 'Some error occurred while updating a book');
    }
};


const deleteBook = async (req, res) => {
    const bookId = new ObjectId(req.params.id);
    console.log('Deleting book with ID:', bookId); // Log the book ID being deleted
    const response = await mongodb.getDatabase().db().collection('Books').deleteOne({ _id: bookId });
    console.log('MongoDB response:', response); // Log the response from MongoDB
    if (response.deletedCount > 0) {
        res.status(204).send(); // Status 204 for successful deletion
    } else {
        console.error('Error deleting book:', response.error); // Log errors
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