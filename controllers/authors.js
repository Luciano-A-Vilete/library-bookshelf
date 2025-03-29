const { check, validationResult } = require('express-validator');
const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

// Retrieve all authors from the "Authors" collection
const getAllAuthors = async (req, res, next) => {
  try {
    console.log('Fetching all authors...');
    // Get the "Authors" collection from the database
    const result = await mongodb.getDatabase().collection('Authors').find();
    const authors = await result.toArray();
    console.log('Authors fetched:', authors);
    res.status(200).json(authors);
  } catch (err) {
    console.error('Error fetching authors:', err);
    next(err);
  }
};

// Retrieve a single author by ID from the "Authors" collection
const getSingleAuthor = async (req, res, next) => {
  try {
    const authorId = new ObjectId(req.params.id);
    console.log('Fetching author with ID:', authorId);
    // Find the author by _id
    const result = await mongodb.getDatabase().collection('Authors').find({ _id: authorId });
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

// Create a new author and dynamically add associated books
const createAuthor = [
  // Validation rules
  check('name').notEmpty().withMessage('Name is required'),
  check('books').isArray().withMessage('Books must be an array'),

  // Request handler middleware
  async (req, res, next) => {
    // Normalize request payload keys to lower case
    const normalizedBody = {};
    Object.keys(req.body).forEach((key) => {
      normalizedBody[key.toLowerCase()] = req.body[key];
    });
    req.body = normalizedBody;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, books } = req.body;
      // Create the author object
      const author = { name, books };

      // Check if the author already exists in the collection
      const existingAuthor = await mongodb.getDatabase().collection('Authors').findOne({ name });
      if (existingAuthor) {
        return res.status(400).json({ error: 'Author already exists. Use updateAuthor to modify the data.' });
      }

      // Insert the new author into the "Authors" collection
      const authorResponse = await mongodb.getDatabase().collection('Authors').insertOne(author);
      console.log('Author created:', authorResponse);

      // Dynamically synchronize the books in the "Books" collection
      const bookPromises = books.map(async (title) => {
        const book = { title, author: name };
        const bookResponse = await mongodb.getDatabase().collection('Books').updateOne(
          { title }, // Query by book title
          { $set: book },
          { upsert: true } // Create the book if it does not exist
        );
        console.log('Book added dynamically:', bookResponse);
      });
      await Promise.all(bookPromises);

      res.status(201).json({ message: 'Author created and books added dynamically.' });
    } catch (err) {
      console.error('Error creating author dynamically:', err);
      next(err);
    }
  }
];

// Update an author and synchronize changes in the "Books" collection
const updateAuthor = [
  // Validation rules
  check('name').notEmpty().withMessage('Name is required'),
  check('books').isArray().withMessage('Books must be an array'),

  // Request handler middleware
  async (req, res, next) => {
    // Normalize request payload keys to lower case
    const normalizedBody = {};
    Object.keys(req.body).forEach((key) => {
      normalizedBody[key.toLowerCase()] = req.body[key];
    });
    req.body = normalizedBody;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const authorId = new ObjectId(req.params.id);
      const { name, books } = req.body;

      // Find the existing author by name rather than by _id
      const existingAuthor = await mongodb.getDatabase().collection('Authors').findOne({ name });
      if (!existingAuthor) {
        return res.status(404).json({ error: 'Author not found.' });
      }

      // Update the author's books in the "Authors" collection
      const updateResponse = await mongodb.getDatabase().collection('Authors').updateOne(
        { name },
        { $set: { books } }
      );
      console.log('Author updated:', updateResponse);

      // Determine which books to remove and which to add
      const booksToRemove = existingAuthor.books.filter((book) => !books.includes(book));
      const booksToAdd = books.filter((book) => !existingAuthor.books.includes(book));

      // Remove books that are no longer associated with the author
      const removeOldBooksPromises = booksToRemove.map(async (title) => {
        const response = await mongodb.getDatabase().collection('Books').deleteOne({ title, author: name });
        console.log('Book removed dynamically:', response);
      });
      await Promise.all(removeOldBooksPromises);

      // Add new books to the "Books" collection
      const addNewBooksPromises = booksToAdd.map(async (title) => {
        const book = { title, author: name };
        const response = await mongodb.getDatabase().collection('Books').updateOne(
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

// Delete an author along with all books associated with the author
const deleteAuthor = async (req, res, next) => {
  try {
    // Normalize payload keys (if present)
    if (req.body) {
      const normalizedBody = {};
      Object.keys(req.body).forEach((key) => {
        normalizedBody[key.toLowerCase()] = req.body[key];
      });
      req.body = normalizedBody;
    }

    const authorId = new ObjectId(req.params.id);
    // Retrieve the author to be deleted from the "Authors" collection
    const author = await mongodb.getDatabase().collection('Authors').findOne({ _id: authorId });
    if (!author) {
      return res.status(404).json({ error: 'Author not found.' });
    }

    // Delete the author
    const deleteResponse = await mongodb.getDatabase().collection('Authors').deleteOne({ _id: authorId });
    console.log('Author deleted:', deleteResponse);

    // Remove all books associated with the deleted author from the "Books" collection
    const bookDeleteResponse = await mongodb.getDatabase().collection('Books').deleteMany({ author: author.name });
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
