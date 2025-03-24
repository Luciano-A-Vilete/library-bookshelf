const routes = require('express').Router();

const authorController = require('../controllers/authors');

routes.get('/', authorController.getAll);

routes.get('/:id', authorController.getSingle);

module.exports = routes;