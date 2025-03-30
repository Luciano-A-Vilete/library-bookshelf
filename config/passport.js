// config/passport.js

require('dotenv').config(); // ensure env variables are loaded

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { findByUsername, comparePassword } = require('../models/userModel');
const { getDatabase } = require('../data/database');
const { ObjectId } = require('mongodb');

/*
 * Local Strategy
 */
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const db = getDatabase();
      const user = await findByUsername(db, username);
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

/*
 * GitHub Strategy
 */
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const db = getDatabase();
      // Attempt to find a user record with this GitHub ID.
      let user = await db.collection('users').findOne({ githubId: profile.id });
      if (user) {
        return done(null, user);
      }
      // Optionally, check if a user exists with the same email.
      if (profile.emails && profile.emails.length > 0) {
        user = await db.collection('users').findOne({ email: profile.emails[0].value });
        if (user) {
          // Link the GitHub account if it’s not already linked.
          await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { githubId: profile.id } }
          );
          return done(null, user);
        }
      }
      // If no user was found, create a new user record using GitHub profile details.
      const newUser = {
        username: profile.username || profile.displayName,
        email: (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : '',
        githubId: profile.id
        // You can add additional fields as needed.
      };
      const result = await db.collection('users').insertOne(newUser);
      newUser._id = result.insertedId;
      return done(null, newUser);
    } catch (err) {
      return done(err);
    }
  }
));

/*
 * Serialization/Deserialization for sessions.
 * Both strategies now result in a (MongoDB) user record that has an _id.
 */
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const db = getDatabase();
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
