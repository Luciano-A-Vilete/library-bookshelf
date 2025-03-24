const routes = require('express').Router();

routes.get('/', (req, res) => { res.send('Welcome to your new Library Bookshelf') });

routes.use('/books', require('./books'));
routes.use('/authors', require('./authors'));

module.exports = routes;