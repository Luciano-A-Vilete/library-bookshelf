// server.js

const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('./data/database.js');
const session = require('express-session');
const passport = require('./config/passport');
const app = express();

const port = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Set up session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'aSecretKey', // Use an environment variable in production
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport and restore authentication state from the session
app.use(passport.initialize());
app.use(passport.session());

// Set CORS headers; adjust these settings as needed for your security requirements
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Z-Key'
  );
  res.setHeader('Acces-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Use the main routes set up in the routes folder
app.use('/', require('./routes'));

// Initialize MongoDB connection and start the server once connected
mongodb.initDb((err) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(port, () => {
      console.log(`Running on port ${port}`);
    });
  }
});
