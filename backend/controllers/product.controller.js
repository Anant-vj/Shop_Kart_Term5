const mongoose = require('mongoose');
const Product = require('../models/product.model');

/**
 * Task 2: Create a new Product
 * POST /products
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Validation: Missing required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      price === null ||
      price === '' ||
      !category ||
      !image ||
      stock === undefined ||
      stock === null ||
      stock === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field. Required: name, description, price, category, image, stock',
      });
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    // Validation: Invalid price (> 0 required)
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price: price must be a number greater than 0',
      });
    }

    // Validation: Invalid stock (>= 0 required)
    if (isNaN(numericStock) || numericStock < 0 || !Number.isInteger(numericStock)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock: stock cannot be negative and must be an integer',
      });
    }

    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numericStock,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error creating product',
      error: error.message,
    });
  }
};

/**
 * Task 3 & Task 5: Get All Products (with Search, Category Filtering, and Bonus Sorting)
 * GET /products?search=...&category=...&sort=...
 */
const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    // Build query filter dynamically
    const query = {};

    // Search filter: case-insensitive name matching
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    // Category filter: match exact category name (case-insensitive)
    if (
      category &&
      category.trim() &&
      !['all', 'all categories'].includes(category.trim().toLowerCase())
    ) {
      query.category = { $regex: `^${category.trim()}$`, $options: 'i' };
    }

    // Bonus Challenge (+10 Marks): Dynamic sorting
    let sortCriteria = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortCriteria = { price: 1 };
    } else if (sort === 'price_desc') {
      sortCriteria = { price: -1 };
    } else if (sort === 'name_asc') {
      sortCriteria = { name: 1 };
    } else if (sort === 'name_desc') {
      sortCriteria = { name: -1 };
    }

    const products = await Product.find(query)
      .sort(sortCriteria)
      .select('_id name description price category image stock createdAt');

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching products',
      error: error.message,
    });
  }
};

/**
 * Task 4: Get Single Product by ID
 * GET /products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Failure case: Invalid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(id);

    // Failure case: Product not found
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving product',
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
};
