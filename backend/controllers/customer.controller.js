const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');

/**
 * Task 1 — Register a Customer
 * POST /customers/register
 */
const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Validation: All fields are mandatory
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are mandatory (fullName, email, password, phone)',
      });
    }

    // Validation: Password must contain at least 6 characters
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters',
      });
    }

    // Validation: Email must be unique
    const normalizedEmail = email.toLowerCase().trim();
    const existingCustomer = await Customer.findOne({ email: normalizedEmail });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Create new customer instance (password will be hashed by pre-save hook)
    const customer = new Customer({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      phone: phone.trim(),
    });

    await customer.save();

    // Success response - password is NEVER exposed
    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

/**
 * Task 2 — Login Customer
 * POST /customers/login
 */
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation: Email and password must be supplied
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find customer by email
    const normalizedEmail = email.toLowerCase().trim();
    const customer = await Customer.findOne({ email: normalizedEmail });

    // Failure case: Invalid credentials (Generic error without leaking email/password existence)
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Compare password using bcrypt
    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT and store in HttpOnly cookie
    generateToken(res, customer._id);

    // Return success response with customer info (excluding password)
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

/**
 * Task 3 — Get Authenticated Customer Profile
 * GET /customers/me
 * Protected Route (Authentication Middleware sets req.user)
 */
const getProfile = async (req, res) => {
  try {
    // req.user was attached by auth.middleware.js with password excluded
    return res.status(200).json({
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: error.message,
    });
  }
};

/**
 * Task 4 — Logout Customer
 * POST /customers/logout
 * Clears the authentication HttpOnly cookie
 */
const logoutCustomer = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message,
    });
  }
};

/**
 * Bonus Challenge (+10 Marks) — Change Password
 * PATCH /customers/change-password
 * Protected Route
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both oldPassword and newPassword are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must contain at least 6 characters',
      });
    }

    // Retrieve user including current password hash
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Verify old password
    const isOldPasswordMatch = await customer.comparePassword(oldPassword);
    if (!isOldPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect old password',
      });
    }

    // Update password (pre-save hook will hash the new password)
    customer.password = newPassword;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while changing password',
      error: error.message,
    });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
  changePassword,
};
