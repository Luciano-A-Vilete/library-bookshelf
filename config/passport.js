// config/passport.js

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { findByUsername, comparePassword } = require('../models/userModel');
const { getDatabase } = require('../data/database');
const { ObjectId } = require('mongodb');

// Configure the local strategy for user login
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      // Retrieve the database connection
      const db = getDatabase();
      // Find the user by username
      const user = await findByUsername(db, username);
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      // Compare the provided password with the stored hash
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password' });
      }
      // If the credentials are valid, return the user
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize the user to store in the session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize the user from the session using the stored user id
passport.deserializeUser(async (id, done) => {
  try {
    // Retrieve the database connection
    const db = getDatabase();
    // Convert the id string back to ObjectId
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!user) {
      return done(new Error('User not found'));
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
});

module.exports = passport;
