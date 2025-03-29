// routes/auth.js
// This router handles authentication endpoints: user registration, login, and logout.

const routes = require('express').Router();
const passport = require('passport');
const { getDatabase } = require('../data/database');
const { createUser } = require('../models/userModel');

// Route for user registration
routes.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const db = getDatabase();
    // Check if a user with the same username or email already exists
    const existingUser = await db.collection('users').findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists.' });
    }
    // Create the user with hashed password
    const user = await createUser(db, { username, email, password });
    res.status(201).json({ message: 'User created successfully!', user });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Route for user login using Passport Local Strategy
routes.post('/login', (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    if (error) return next(error);
    if (!user) return res.status(400).json({ message: info.message || 'Authentication failed' });
    // Log the user in
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({ message: 'Login successful', user });
    });
  })(req, res, next);
});

// Route for user logout
routes.post('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.json({ message: 'Logout successful' });
  });
});

module.exports = routes;
