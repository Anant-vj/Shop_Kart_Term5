const Razorpay = require('razorpay');

/**
 * Razorpay Instance Configuration
 * Uses Test Mode keys loaded from environment variables.
 * CRITICAL SECURITY: RAZORPAY_KEY_SECRET is strictly stored on the backend
 * and must never be exposed to the React frontend or API responses.
 */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_shopkart123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'shopkart_test_secret_key_2026',
});

module.exports = razorpay;
