const routes = require('express').Router();

const authorController = require('../controllers/authors');

routes.get('/', authorController.getAll);

routes.get('/:id', authorController.getSingle);

routes.post('/', authorController.createAuthor);

routes.put('/:id', authorController.updateAuthor);

routes.delete('/:id', authorController.deleteAuthor);

module.exports = routes;