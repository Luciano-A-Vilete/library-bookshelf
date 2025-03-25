const routes = require('express').Router();

const bookController = require('../controllers/books');

routes.get('/', bookController.getAllBooks);

routes.get('/:id', bookController.getSingleBook);

routes.post('/', bookController.createBook);

routes.put('/:id', bookController.updateBook);

routes.delete('/:id', bookController.deleteBook);

module.exports = routes;