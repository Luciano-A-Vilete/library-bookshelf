// routes/author.js
// This router handles the routes for authors.
// Public endpoints: GET (retrieve all authors and a single author).
// Protected endpoints: POST, PUT, DELETE (require an authenticated user).

const routes = require('express').Router();
const authorController = require('../controllers/authors');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Public routes
routes.get('/', authorController.getAllAuthors);
routes.get('/:id', authorController.getSingleAuthor);

// Protected routes: user must be authenticated
routes.post('/', isAuthenticated, authorController.createAuthor);
routes.put('/:id', isAuthenticated, authorController.updateAuthor);
routes.delete('/:id', isAuthenticated, authorController.deleteAuthor);

module.exports = routes;
