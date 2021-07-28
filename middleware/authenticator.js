const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get token from header, created by initial res.json, (when req sent to protected route) is required
// if access token is expired - refresh w/reftoken
// pass via header in the auth actions from redux...
module.exports = async function(req, res, next) {
  // varify header exists, get token from header
  const authHeader = String(req.header('Authorization'));
  let decoded;

  // Check if not token - if route is protected via this middleware
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7, authHeader.length);
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      // decoded has user in payload (attatched user w/id in payload), if true grant user access, false logout
      req.user = decoded.user;
      next();
    } catch (err) {
      console.error(err.message);
      return res.status(401).send("Server Error! Token is not valid.");
    }    
  } else {
    res.status(403).json({ msg: 'No token. Authorization denied.'});
  }
};