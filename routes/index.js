// routes/index.js
// Main router that aggregates all individual route modules.

const routes = require('express').Router();

routes.use('/', require('./swagger'));

routes.get('/', (req, res) => {
  // Basic welcome route
  res.send('Welcome to your new Library Bookshelf');
});

routes.use('/books', require('./books'));
routes.use('/authors', require('./authors'));
routes.use('/auth', require('./auth')); // Added authentication routes

module.exports = routes;
