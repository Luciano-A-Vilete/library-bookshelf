// controllers/books.js

const { check, validationResult } = require('express-validator');
const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

// Retrieve all books from the "Books" collection
const getAllBooks = async (req, res, next) => {
  try {
    console.log('Fetching all books...');
    // Use the "Books" collection directly from the connected database
    const result = await mongodb.getDatabase().collection('Books').find();
    const books = await result.toArray();
    console.log('Books fetched:', books);
    res.status(200).json(books);
  } catch (err) {
    console.error('Error fetching books:', err);
    next(err);
  }
};

// Retrieve a single book by ID from the "Books" collection
const getSingleBook = async (req, res, next) => {
  try {
    const bookId = new ObjectId(req.params.id);
    console.log('Fetching book with ID:', bookId);
    // Get the book document by matching the _id
    const result = await mongodb.getDatabase().collection('Books').find({ _id: bookId });
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

// Create a new book and update or create the author accordingly
const createBook = [
  // Validation rules
  check('title').notEmpty().withMessage('Title is required'),
  check('author').notEmpty().withMessage('Author is required'),
  check('publisher').notEmpty().withMessage('Publisher is required'),
  check('category').notEmpty().withMessage('Category is required'),
  check('totalPages').isInt({ gt: 0 }).withMessage('Total pages must be a positive integer'),

  // Request handler middleware
  async (req, res, next) => {
    // Normalize request payload keys to lowercase and standardize field naming
    const normalizedBody = {};
    Object.keys(req.body).forEach((key) => {
      const lowerCaseKey = key.toLowerCase();
      switch (lowerCaseKey) {
        case 'title':
          normalizedBody['title'] = req.body[key];
          break;
        case 'author':
          normalizedBody['author'] = req.body[key];
          break;
        case 'publisher':
          normalizedBody['publisher'] = req.body[key];
          break;
        case 'category':
          normalizedBody['category'] = req.body[key];
          break;
        case 'totalpages': // Map 'totalpages' to 'totalPages'
          normalizedBody['totalPages'] = req.body[key];
          break;
        default:
          normalizedBody[lowerCaseKey] = req.body[key];
      }
    });
    req.body = normalizedBody;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, author, publisher, category, totalPages } = req.body;
      // Create the book object
      const book = { title, author, publisher, category, totalPages };

      // Insert the new book into the "Books" collection
      const bookResponse = await mongodb.getDatabase().collection('Books').insertOne(book);
      console.log('Book created:', bookResponse);

      // Update the author associated with this book
      // Use a case-insensitive regex to find the author
      const authorResponse = await mongodb.getDatabase().collection('Authors').findOne({
        name: { $regex: new RegExp(`^${author}$`, 'i') }
      });
      if (authorResponse) {
        // If the author exists, push the new book title into their books array
        const updateResponse = await mongodb.getDatabase().collection('Authors').updateOne(
          { name: authorResponse.name },
          { $push: { books: title } }
        );
        console.log('Author updated with new book:', updateResponse);
      } else {
        // If the author does not exist, create a new author document
        const newAuthor = {
          name: author,
          books: [title]
        };
        const newAuthorResponse = await mongodb.getDatabase().collection('Authors').insertOne(newAuthor);
        console.log('New author created:', newAuthorResponse);
      }

      res.status(201).json({ message: 'Book created and author updated dynamically.' });
    } catch (err) {
      console.error('Error creating book dynamically:', err);
      next(err);
    }
  }
];

// Update an existing book and synchronize changes with the authors collection if needed
const updateBook = [
  // Validation rules
  check('title').notEmpty().withMessage('Title is required'),
  check('author').notEmpty().withMessage('Author is required'),
  check('publisher').notEmpty().withMessage('Publisher is required'),
  check('category').notEmpty().withMessage('Category is required'),
  check('totalPages').isInt({ gt: 0 }).withMessage('Total pages must be a positive integer'),

  // Request handler middleware
  async (req, res, next) => {
    // Normalize request payload keys to lowercase
    const normalizedBody = {};
    Object.keys(req.body).forEach((key) => {
      const lowerCaseKey = key.toLowerCase();
      switch (lowerCaseKey) {
        case 'title':
          normalizedBody['title'] = req.body[key];
          break;
        case 'author':
          normalizedBody['author'] = req.body[key];
          break;
        case 'publisher':
          normalizedBody['publisher'] = req.body[key];
          break;
        case 'category':
          normalizedBody['category'] = req.body[key];
          break;
        case 'totalpages': // Map 'totalpages' to 'totalPages'
          normalizedBody['totalPages'] = req.body[key];
          break;
        default:
          normalizedBody[lowerCaseKey] = req.body[key];
      }
    });
    req.body = normalizedBody;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const bookId = new ObjectId(req.params.id);
      const { title, author, publisher, category, totalPages } = req.body;
      
      // Fetch the existing book from the "Books" collection
      const existingBook = await mongodb.getDatabase().collection('Books').findOne({ _id: bookId });
      if (!existingBook) {
        return res.status(404).json({ error: 'Book not found.' });
      }
      
      // Update the book document with new data
      const updateResponse = await mongodb.getDatabase().collection('Books').updateOne(
        { _id: bookId },
        { $set: { title, author, publisher, category, totalPages } }
      );
      console.log('Book updated:', updateResponse);
      
      // If the author has changed, update the authors collection accordingly
      if (existingBook.author !== author) {
        // Remove the book title from the previous author's books array
        await mongodb.getDatabase().collection('Authors').updateOne(
          { name: existingBook.author },
          { $pull: { books: existingBook.title } }
        );
        // Add the book title to the new author's books array (upserting if the author does not exist)
        await mongodb.getDatabase().collection('Authors').updateOne(
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

// Delete a book and update the author document accordingly
const deleteBook = async (req, res, next) => {
  try {
    // Normalize payload keys if present, to ensure consistency
    if (req.body) {
      const normalizedBody = {};
      Object.keys(req.body).forEach((key) => {
        normalizedBody[key.toLowerCase()] = req.body[key];
      });
      req.body = normalizedBody;
    }
    
    const bookId = new ObjectId(req.params.id);
    
    // Retrieve the book to be deleted from the "Books" collection
    const book = await mongodb.getDatabase().collection('Books').findOne({ _id: bookId });
    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }
    
    // Delete the book document
    const deleteResponse = await mongodb.getDatabase().collection('Books').deleteOne({ _id: bookId });
    console.log('Book deleted:', deleteResponse);
    
    // Remove the book title from the corresponding author's books array
    const authorUpdateResponse = await mongodb.getDatabase().collection('Authors').updateOne(
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
};
