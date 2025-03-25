const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
    //swagger.tags=['Authors']
    try {
        console.log('Fetching all authors...');
        const result = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').find();
        const authors = await result.toArray();
        console.log('Authors fetched:', authors); // Log the authors retrieved
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(authors);
    } catch (err) {
        console.error('Error fetching authors:', err); // Log errors if they occur
        res.status(500).json({ error: 'Failed to fetch authors.' });
    }
};


const getSingle = async (req, res) => {
    //swagger.tags=['Authors']
    try {
        const authorId = new ObjectId(req.params.id);
        console.log('Fetching author with ID:', authorId); // Log the author ID being fetched
        const result = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').find({ _id: authorId });
        const authors = await result.toArray();
        console.log('Author fetched:', authors[0]); // Log the specific author retrieved
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(authors[0]);
    } catch (err) {
        console.error('Error fetching author:', err); // Log errors if they occur
        res.status(500).json({ error: 'Failed to fetch author.' });
    }
};


const createAuthor = async (req, res) => {
    //swagger.tags=['Authors']
    try {
        console.log('Request body:', req.body); // Log the incoming request data
        const author = {
            name: req.body.name,
            books: req.body.books
        };
        console.log('Author to be created:', author); // Log the author object to be inserted
        const response = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').insertOne(author);
        console.log('MongoDB response:', response); // Log the response from MongoDB
        if (response.insertedId) {
            res.status(201).send(); // Status 201 for successful creation
        } else {
            throw new Error('Failed to insert author');
        }
    } catch (err) {
        console.error('Error creating author:', err); // Log errors
        res.status(500).json({ error: 'Failed to create author.' });
    }
};


const updateAuthor = async (req, res) => {
    //swagger.tags=['Authors']
    try {
        const authorId = new ObjectId(req.params.id);
        console.log('Updating author with ID:', authorId); // Log the author ID being updated
        console.log('Request body:', req.body); // Log the incoming request data
        const author = {
            name: req.body.name,
            books: req.body.books
        };
        console.log('Author to update:', author); // Log the updated author data
        const response = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').replaceOne({ _id: authorId }, author);
        console.log('MongoDB response:', response); // Log the response from MongoDB
        if (response.modifiedCount > 0) {
            res.status(204).send(); // Status 204 for successful update
        } else {
            throw new Error('No records were updated');
        }
    } catch (err) {
        console.error('Error updating author:', err); // Log errors
        res.status(500).json({ error: 'Failed to update author.' });
    }
};


const deleteAuthor = async (req, res) => {
    //swagger.tags=['Authors']
    try {
        const authorId = new ObjectId(req.params.id);
        console.log('Deleting author with ID:', authorId); // Log the author ID being deleted
        const response = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').deleteOne({ _id: authorId });
        console.log('MongoDB response:', response); // Log the response from MongoDB
        if (response.deletedCount > 0) {
            res.status(204).send(); // Status 204 for successful deletion
        } else {
            throw new Error('No records were deleted');
        }
    } catch (err) {
        console.error('Error deleting author:', err); // Log errors
        res.status(500).json({ error: 'Failed to delete author.' });
    }
};


module.exports = {
    getAll,
    getSingle,
    createAuthor,
    updateAuthor,
    deleteAuthor
};