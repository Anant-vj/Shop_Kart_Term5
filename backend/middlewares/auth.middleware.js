const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

/**
 * Authentication Middleware:
 * Protects private routes by extracting and verifying the JWT stored inside cookies.
 * Attaches the authenticated customer document (with password omitted) to req.user.
 */
const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies && req.cookies.token;

    // Also support Authorization: Bearer <token> for Postman / API clients
    if (!token && req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
      });
    }

    // Verify token validity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Retrieve customer document from MongoDB, explicitly omitting the hashed password
    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer not found',
      });
    }

    // Attach customer to req.user for downstream controllers
    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
    });
  }
};

module.exports = { protectRoute };
