const routes = require('express').Router();

routes.use('/', require('./swagger'));

routes.get('/', (req, res) =>
    //swagger.tags=['Welcome'] 
    { res.send('Welcome to your new Library Bookshelf') });

routes.use('/books', require('./books'));
routes.use('/authors', require('./authors'));

module.exports = routes;