const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

/**
 * Task 2: Add Product to Cart
 * POST /cart/:productId
 * Protected: Identifies user from JWT (req.user)
 * Behavior:
 * - If product not in cart: adds with quantity = 1
 * - If product already in cart: increments quantity by 1
 * - Validates that requested quantity does not exceed available stock
 */
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // Verify product exists in database catalog
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Stock check: product must have at least 1 unit available
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock',
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

    if (!user.cart) {
      user.cart = [];
    }

    // Check if the product is already in user's cart
    const existingIndex = user.cart.findIndex(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    let targetQuantity = 1;
    if (existingIndex !== -1) {
      targetQuantity = user.cart[existingIndex].quantity + 1;
    }

    // Stock limit validation
    if (targetQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${product.stock})`,
      });
    }

    // Apply mutation
    if (existingIndex !== -1) {
      user.cart[existingIndex].quantity = targetQuantity;
    } else {
      user.cart.push({
        product: productId,
        quantity: 1,
      });
    }

    await user.save();

    // Populate product details in returned cart
    await user.populate({
      path: 'cart.product',
      select: 'name price image stock category description',
    });

    const validCart = (user.cart || []).filter(
      (item) => item.product !== null && item.product !== undefined
    );

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: validCart,
    });
  } catch (error) {
    console.error('Error in addToCart:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding product to cart',
      error: error.message,
    });
  }
};

/**
 * Task 3: Get Current User's Cart
 * GET /cart
 * Protected: Populates product information for each cart item
 */
const getCart = async (req, res) => {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price image stock category description',
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found',
      });
    }

    // Clean any null product entries (e.g., if a product was deleted from DB)
    const validCart = (user.cart || []).filter(
      (item) => item.product !== null && item.product !== undefined
    );

    return res.status(200).json({
      success: true,
      cart: validCart,
    });
  } catch (error) {
    console.error('Error in getCart:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching cart',
      error: error.message,
    });
  }
};

/**
 * Task 4: Update Product Quantity
 * PATCH /cart/:productId
 * Protected: Body contains { quantity }
 * Rules:
 * - quantity must be a number
 * - quantity >= 1
 * - quantity <= product.stock
 * - product must already exist in cart
 */
const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate productId format
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // Validate quantity is valid number and at least 1
    const parsedQty = Number(quantity);
    if (
      quantity === undefined ||
      isNaN(parsedQty) ||
      !Number.isInteger(parsedQty) ||
      parsedQty < 1
    ) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be an integer of at least 1',
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

    // Retrieve user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found',
      });
    }

    // Check if product is in user's cart
    const itemIndex = (user.cart || []).findIndex(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    // Validate against product stock
    if (parsedQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${product.stock})`,
      });
    }

    // Update quantity and save
    user.cart[itemIndex].quantity = parsedQty;
    await user.save();

    await user.populate({
      path: 'cart.product',
      select: 'name price image stock category description',
    });

    const validCart = (user.cart || []).filter(
      (item) => item.product !== null && item.product !== undefined
    );

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated',
      cart: validCart,
    });
  } catch (error) {
    console.error('Error in updateQuantity:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating cart quantity',
      error: error.message,
    });
  }
};

/**
 * Task 5: Remove Product from Cart
 * DELETE /cart/:productId
 * Protected: Removes product from user's cart
 */
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found',
      });
    }

    // Check if product is in cart
    const itemIndex = (user.cart || []).findIndex(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    // Remove item from cart
    user.cart.splice(itemIndex, 1);
    await user.save();

    await user.populate({
      path: 'cart.product',
      select: 'name price image stock category description',
    });

    const validCart = (user.cart || []).filter(
      (item) => item.product !== null && item.product !== undefined
    );

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: validCart,
    });
  } catch (error) {
    console.error('Error in removeFromCart:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing product from cart',
      error: error.message,
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
};
