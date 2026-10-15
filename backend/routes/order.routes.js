const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middlewares/auth.middleware');
const {
  createPaymentOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  simulatePayment,
} = require('../controllers/order.controller');

/**
 * All Order routes require authentication via protectRoute
 */
router.use(protectRoute);

// Task 4: Create Pending ShopKart + Razorpay Order
router.post('/create-payment-order', createPaymentOrder);

// Convenience route for Postman Test 1 & 8
router.post('/', createPaymentOrder);

// Task 4 & Step 11: Verify Razorpay Payment Signature and Confirm Order
router.post('/verify-payment', verifyPayment);

// Dev / Test Mode: Simulate payment gateway response
router.post('/simulate-payment', simulatePayment);

// Task 7: Get all orders for the authenticated customer
router.get('/', getUserOrders);

// Task 8 / Section 17: Get single order by ID with ownership enforcement
router.get('/:id', getOrderById);

// Bonus: Order status progression (PLACED -> CONFIRMED -> SHIPPED -> DELIVERED)
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
