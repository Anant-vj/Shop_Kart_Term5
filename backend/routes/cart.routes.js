const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
} = require('../controllers/cart.controller');
const { protectRoute } = require('../middlewares/auth.middleware');

// All Cart endpoints require JWT authentication
router.use(protectRoute);

// Task 3: Get current user's cart
router.get('/', getCart);

// Task 2: Add product to cart (or increment quantity)
router.post('/:productId', addToCart);

// Task 4: Update product quantity
router.patch('/:productId', updateQuantity);

// Task 5: Remove product from cart
router.delete('/:productId', removeFromCart);

module.exports = router;
