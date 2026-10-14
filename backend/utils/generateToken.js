const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT and attaches it to an HttpOnly cookie on the response.
 * @param {object} res - Express response object
 * @param {string|mongoose.Types.ObjectId} customerId - The customer's MongoDB ObjectId
 * @returns {string} - The signed JSON Web Token
 */
const generateToken = (res, customerId) => {
  const token = jwt.sign({ id: customerId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  res.cookie('token', token, {
    httpOnly: true, // Crucial: Prevents JavaScript (document.cookie) access (XSS mitigation)
    secure: process.env.NODE_ENV === 'production', // Send over HTTPS only in production
    sameSite: 'strict', // Protects against Cross-Site Request Forgery (CSRF)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  return token;
};

module.exports = generateToken;
