// models/userModel.js

const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;

/**
 * Create a new user with a hashed password.
 * @param {object} db - The MongoDB database instance.
 * @param {object} userData - An object containing username, email, and password.
 * @returns {object} - The created user with the inserted _id.
 */
async function createUser(db, { username, email, password }) {
  // Generate a salt and hash the password.
  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  const hash = await bcrypt.hash(password, salt);
  const user = { username, email, password: hash };

  // Insert the user into the 'users' collection.
  const result = await db.collection('users').insertOne(user);
  // Append the generated _id to our user object.
  user._id = result.insertedId;
  return user;
}

/**
 * Find a user by username.
 * @param {object} db - The MongoDB database instance.
 * @param {string} username - The username to search for.
 * @returns {object|null} - Returns the user object if found, otherwise null.
 */
async function findByUsername(db, username) {
  return await db.collection('users').findOne({ username });
}

/**
 * Compare a candidate password with the stored hashed password.
 * @param {string} candidatePassword - The plain text password to compare.
 * @param {string} hash - The hashed password stored in the database.
 * @returns {boolean} - True if the passwords match; false otherwise.
 */
async function comparePassword(candidatePassword, hash) {
  return await bcrypt.compare(candidatePassword, hash);
}

module.exports = {
  createUser,
  findByUsername,
  comparePassword
};
