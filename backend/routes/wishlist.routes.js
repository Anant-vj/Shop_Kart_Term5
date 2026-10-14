const express = require('express');
const router = express.Router();
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
} = require('../controllers/wishlist.controller');
const { protectRoute } = require('../middlewares/auth.middleware');

// All Wishlist routes require JWT authentication
router.use(protectRoute);

// Task 3: Get current authenticated user's wishlist
router.get('/', getWishlist);

// Task 2: Add product to wishlist
router.post('/:productId', addToWishlist);

// Task 4: Remove product from wishlist
router.delete('/:productId', removeFromWishlist);

// Bonus Challenge (+10 Marks): Wishlist toggle
router.patch('/:productId/toggle', toggleWishlist);

module.exports = router;
