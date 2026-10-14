const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
  changePassword,
} = require('../controllers/customer.controller');
const { protectRoute } = require('../middlewares/auth.middleware');

// Public routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// Protected routes (Require valid JWT in HttpOnly cookie)
router.get('/me', protectRoute, getProfile);
router.post('/logout', protectRoute, logoutCustomer);

// Bonus challenge route (+10 Marks)
router.patch('/change-password', protectRoute, changePassword);

module.exports = router;
