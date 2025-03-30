// server.js

require('dotenv').config(); // Load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('./data/database.js');
const session = require('express-session');
const passport = require('./config/passport'); // GitHub & Local passport config now live here
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Parse JSON requests
app.use(bodyParser.json());

// Set up session middleware using the secret from .env
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport and configure persistent sessions.
app.use(passport.initialize());
app.use(passport.session());

// Set CORS headers and allowed methods.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Z-Key, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, PATCH, OPTIONS, DELETE");
  next();
});
app.use(cors({
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  origin: '*'
}));

// Main application routes.
app.use('/', require('./routes/index.js'));

// ---------------------
// GitHub Authentication Routes
// ---------------------

// Route to initiate GitHub authentication.
app.get('/github', passport.authenticate('github'));

// GitHub callback route. If successful, Passport will serialize the user.
app.get('/github/callback', passport.authenticate('github', {
  failureRedirect: '/api-docs'
}), (req, res) => {
  // For backwards compatibility, also store the user in req.session.user.
  req.session.user = req.user;
  res.redirect('/');
});

// Home route that checks Passport's req.user for login status.
app.get('/', (req, res) => {
  if (req.user) {
    // Display either the GitHub displayName or the local username.
    const displayName = req.user.displayName || req.user.username || 'User';
    res.send(`Logged in as ${displayName}`);
  } else {
    res.send("Logged out");
  }
});

// Initialize MongoDB connection and start the server.
mongodb.initDb((err) => {
  if (err) {
    console.error('Failed to connect to database.', err);
  } else {
    app.listen(port, () => {
      console.log(`Running on port ${port}`);
    });
  }
});
