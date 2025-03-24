const routes = require('express').Router();

const bookController = require('../controllers/books');

routes.get('/', bookController.getAll);

routes.get('/:id', bookController.getSingle);

module.exports = routes;