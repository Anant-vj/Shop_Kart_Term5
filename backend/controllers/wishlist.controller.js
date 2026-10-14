const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

/**
 * Task 2: Add Product to Wishlist
 * POST /wishlist/:productId
 * Protected: Requires authenticated user from JWT
 */
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // Verify product exists in catalog
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Retrieve authenticated user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found',
      });
    }

    // Check for duplicate wishlist entry
    const isAlreadyWishlisted = user.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    // Append Product ObjectId reference to user's wishlist
    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      count: user.wishlist.length,
    });
  } catch (error) {
    console.error('Error in addToWishlist:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding product to wishlist',
      error: error.message,
    });
  }
};

/**
 * Task 3: Get Current User's Wishlist with Populated Product Data
 * GET /wishlist
 * Protected: Derives user identity exclusively from req.user
 */
const getWishlist = async (req, res) => {
  try {
    // Find authenticated user and populate wishlist references
    const user = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name description price category image stock createdAt',
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found',
      });
    }

    // Filter out potential null references if any product was purged
    const populatedWishlist = (user.wishlist || []).filter((item) => item !== null && item !== undefined);

    return res.status(200).json({
      success: true,
      count: populatedWishlist.length,
      wishlist: populatedWishlist,
    });
  } catch (error) {
    console.error('Error in getWishlist:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist',
      error: error.message,
    });
  }
};

/**
 * Task 4: Remove Product from Wishlist
 * DELETE /wishlist/:productId
 * Protected: Derives user identity from req.user
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // Retrieve authenticated user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found',
      });
    }

    // Check if the product is present in user's wishlist
    const itemIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    // Remove product ObjectId reference
    user.wishlist.splice(itemIndex, 1);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      count: user.wishlist.length,
    });
  } catch (error) {
    console.error('Error in removeFromWishlist:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing product from wishlist',
      error: error.message,
    });
  }
};

/**
 * Bonus Challenge (+10 Marks): Wishlist Toggle Endpoint
 * PATCH /wishlist/:productId/toggle
 * Protected: Adds if absent, removes if present
 */
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found',
      });
    }

    const existingIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId.toString()
    );

    let saved = false;
    let message = '';

    if (existingIndex !== -1) {
      // Remove product
      user.wishlist.splice(existingIndex, 1);
      saved = false;
      message = 'Product removed from wishlist';
    } else {
      // Add product
      user.wishlist.push(productId);
      saved = true;
      message = 'Product added to wishlist';
    }

    await user.save();

    return res.status(200).json({
      success: true,
      saved,
      message,
      count: user.wishlist.length,
    });
  } catch (error) {
    console.error('Error in toggleWishlist:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while toggling wishlist product',
      error: error.message,
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};
