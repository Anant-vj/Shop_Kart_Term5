const jwt = require('jsonwebtoken');

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Shared cookie options used both when setting and clearing the auth cookie.
 * In production the frontend and backend live on different origins, so the
 * cookie must be SameSite=None and Secure. Locally we fall back to Lax over HTTP.
 * HttpOnly is always on to keep the token out of reach of JavaScript.
 */
const cookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE,
  };
};

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

  res.cookie('token', token, cookieOptions());

  return token;
};

module.exports = generateToken;
module.exports.cookieOptions = cookieOptions;
