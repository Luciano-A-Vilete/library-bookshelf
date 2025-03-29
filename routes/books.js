// routes/books.js
// This router handles the routes for books.
// Public endpoints: GET (retrieve all books and a single book).
// Protected endpoints: POST, PUT, DELETE (require an authenticated user).

const routes = require('express').Router();
const bookController = require('../controllers/books');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Public routes
routes.get('/', bookController.getAllBooks);
routes.get('/:id', bookController.getSingleBook);

// Protected routes: user must be authenticated
routes.post('/', isAuthenticated, bookController.createBook);
routes.put('/:id', isAuthenticated, bookController.updateBook);
routes.delete('/:id', isAuthenticated, bookController.deleteBook);

module.exports = routes;
