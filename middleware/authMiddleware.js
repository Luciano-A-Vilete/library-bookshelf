// middleware/authMiddleware.js
// This middleware checks if the user is authenticated.
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized access. Please log in.' });
  }
  
  module.exports = { isAuthenticated };
  