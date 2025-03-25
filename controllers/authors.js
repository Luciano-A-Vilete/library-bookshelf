const { check, validationResult } = require('express-validator');
const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAllAuthors = async (req, res, next) => {
    try {
        console.log('Fetching all authors...');
        const result = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').find();
        const authors = await result.toArray();
        console.log('Authors fetched:', authors);
        res.status(200).json(authors);
    } catch (err) {
        console.error('Error fetching authors:', err);
        next(err);
    }
};

const getSingleAuthor = async (req, res, next) => {
    try {
        const authorId = new ObjectId(req.params.id);
        console.log('Fetching author with ID:', authorId);
        const result = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').find({ _id: authorId });
        const authors = await result.toArray();
        if (!authors[0]) {
            return res.status(404).json({ error: 'Author not found.' });
        }
        console.log('Author fetched:', authors[0]);
        res.status(200).json(authors[0]);
    } catch (err) {
        console.error('Error fetching author:', err);
        next(err);
    }
};

const createAuthor = [
    // Validation rules
    check('name').notEmpty().withMessage('Name is required'),
    check('books').isArray().withMessage('Books must be an array'),

    // Handler
    async (req, res, next) => {
        // Normalizar o payload para que os campos sejam convertidos para letras minúsculas
        const normalizedBody = {};
        Object.keys(req.body).forEach((key) => {
            normalizedBody[key.toLowerCase()] = req.body[key];
        });
        req.body = normalizedBody;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, books } = req.body;

            // Criar o objeto do autor
            const author = { name, books };

            // Verificar se o autor já existe na coleção
            const existingAuthor = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').findOne({ name });
            if (existingAuthor) {
                return res.status(400).json({ error: 'Author already exists. Use updateAuthor to modify the data.' });
            }

            // Inserir o autor na coleção de autores
            const authorResponse = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').insertOne(author);
            console.log('Author created:', authorResponse);

            // Sincronizar os livros na coleção de livros
            const bookPromises = books.map(async (title) => {
                const book = { title, author: name };
                const bookResponse = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').updateOne(
                    { title }, // Busca pelo título do livro
                    { $set: book },
                    { upsert: true } // Criar o livro se ele ainda não existir
                );
                console.log('Book added dynamically:', bookResponse);
            });
            await Promise.all(bookPromises); // Garantir que todos os livros sejam adicionados

            res.status(201).json({ message: 'Author created and books added dynamically.' });
        } catch (err) {
            console.error('Error creating author dynamically:', err);
            next(err);
        }
    }
];

const updateAuthor = [
    // Validation rules
    check('name').notEmpty().withMessage('Name is required'),
    check('books').isArray().withMessage('Books must be an array'),

    // Handler
    async (req, res, next) => {
        // Normalizar o payload para que os campos sejam convertidos para letras minúsculas
        const normalizedBody = {};
        Object.keys(req.body).forEach((key) => {
            normalizedBody[key.toLowerCase()] = req.body[key];
        });
        req.body = normalizedBody;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const authorId = new ObjectId(req.params.id);
            const { name, books } = req.body;

            // Buscar o autor existente pelo "name" ao invés do "_id"
            const existingAuthor = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').findOne({ name });
            if (!existingAuthor) {
                return res.status(404).json({ error: 'Author not found.' });
            }

            // Atualizar o autor
            const updateResponse = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').updateOne(
                { name },
                { $set: { books } }
            );
            console.log('Author updated:', updateResponse);

            // Sincronizar a coleção de livros
            const booksToRemove = existingAuthor.books.filter((book) => !books.includes(book));
            const booksToAdd = books.filter((book) => !existingAuthor.books.includes(book));

            // Remover os livros que não estão mais associados ao autor
            const removeOldBooksPromises = booksToRemove.map(async (title) => {
                const response = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').deleteOne({ title, author: name });
                console.log('Book removed dynamically:', response);
            });
            await Promise.all(removeOldBooksPromises);

            // Adicionar os novos livros à coleção de livros
            const addNewBooksPromises = booksToAdd.map(async (title) => {
                const book = { title, author: name };
                const response = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').updateOne(
                    { title },
                    { $set: book },
                    { upsert: true }
                );
                console.log('Book added dynamically:', response);
            });
            await Promise.all(addNewBooksPromises);

            res.status(200).json({ message: 'Author updated dynamically.' });
        } catch (err) {
            console.error('Error updating author dynamically:', err);
            next(err);
        }
    }
];

const deleteAuthor = async (req, res, next) => {
    try {
        // Normalizador do payload para garantir consistência (não usado diretamente nesta rota)
        if (req.body) {
            const normalizedBody = {};
            Object.keys(req.body).forEach((key) => {
                normalizedBody[key.toLowerCase()] = req.body[key];
            });
            req.body = normalizedBody;
        }

        const authorId = new ObjectId(req.params.id);

        // Fetch the author to be deleted
        const author = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').findOne({ _id: authorId });
        if (!author) {
            return res.status(404).json({ error: 'Author not found.' });
        }

        // Delete the author
        const deleteResponse = await mongodb.getDatabase().db('Reading-Tracker').collection('Authors').deleteOne({ _id: authorId });
        console.log('Author deleted:', deleteResponse);

        // Remove all books associated with the author
        const bookDeleteResponse = await mongodb.getDatabase().db('Reading-Tracker').collection('Books').deleteMany({ author: author.name });
        console.log('Books removed after author deletion:', bookDeleteResponse);

        res.status(204).send();
    } catch (err) {
        console.error('Error deleting author dynamically:', err);
        next(err);
    }
};


module.exports = {
    getAllAuthors,
    getSingleAuthor,
    createAuthor,
    updateAuthor,
    deleteAuthor
};