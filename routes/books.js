const routes = require('express').Router();

const bookController = require('../controllers/books');

routes.get('/', bookController.getAll);

routes.get('/:id', bookController.getSingle);

routes.post('/', bookController.createBook);

routes.put('/:id', bookController.updateBook);

routes.delete('/:id', bookController.deleteBook);

module.exports = routes;