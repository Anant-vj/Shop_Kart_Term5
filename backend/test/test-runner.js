/**
 * Comprehensive Automated Test Runner for ShopKart Authentication Service
 * Tests all Controllers, Middlewares, Utilities, Validation Rules, Cookie Configurations, and Error Codes.
 */
const assert = require('assert');
const jwt = require('jsonwebtoken');

// Set test environment variables
process.env.JWT_SECRET = 'test_secret_key_12345';
process.env.JWT_EXPIRES_IN = '1d';
process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const generateToken = require('../utils/generateToken');
const { protectRoute } = require('../middlewares/auth.middleware');
const {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
  changePassword,
} = require('../controllers/customer.controller');
const {
  createProduct,
  getAllProducts,
  getProductById,
} = require('../controllers/product.controller');
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
} = require('../controllers/wishlist.controller');

let testsPassed = 0;
let testsFailed = 0;

const runTest = async (testName, testFn) => {
  try {
    await testFn();
    console.log(`  PASS: ${testName}`);
    testsPassed++;
  } catch (err) {
    console.error(`  FAIL: ${testName}`);
    console.error(`    Error: ${err.message}`);
    testsFailed++;
  }
};

// Mock Response Helper
const createMockRes = () => {
  const res = {
    statusCode: 200,
    headers: {},
    cookies: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    cookie(name, val, options) {
      this.cookies[name] = { val, options };
      return this;
    },
    clearCookie(name, options) {
      delete this.cookies[name];
      this.clearedCookie = { name, options };
      return this;
    },
  };
  return res;
};

async function main() {
  console.log('\n=============================================');
  console.log('  SHOPKART AUTHENTICATION SERVICE TEST SUITE  ');
  console.log('=============================================\n');

  console.log('--- 1. Testing generateToken Utility ---');
  await runTest('Generates valid JWT and sets HttpOnly cookie', async () => {
    const res = createMockRes();
    const token = generateToken(res, 'mock-customer-id-123');

    assert.ok(token, 'Token should be returned');
    assert.ok(res.cookies.token, 'Cookie "token" should be set');
    assert.strictEqual(res.cookies.token.options.httpOnly, true, 'Cookie must be HttpOnly');
    assert.strictEqual(res.cookies.token.options.sameSite, 'strict', 'Cookie sameSite must be strict');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert.strictEqual(decoded.id, 'mock-customer-id-123', 'Decoded token id should match');
  });

  console.log('\n--- 2. Testing Customer Registration (Task 1) ---');
  await runTest('Rejects missing fields with 400', async () => {
    const req = { body: { email: 'a@b.com', password: 'password123' } }; // missing fullName and phone
    const res = createMockRes();

    await registerCustomer(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('mandatory'));
  });

  await runTest('Rejects short password (<6 chars) with 400', async () => {
    const req = {
      body: {
        fullName: 'Short Pass',
        email: 'short@example.com',
        password: '123',
        phone: '1234567890',
      },
    };
    const res = createMockRes();

    await registerCustomer(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('6 characters'));
  });

  await runTest('Rejects duplicate email with 409', async () => {
    const originalFindOne = Customer.findOne;
    Customer.findOne = async () => ({ email: 'existing@example.com' });

    const req = {
      body: {
        fullName: 'Existing User',
        email: 'existing@example.com',
        password: 'validpass123',
        phone: '1234567890',
      },
    };
    const res = createMockRes();

    try {
      await registerCustomer(req, res);
      assert.strictEqual(res.statusCode, 409);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Email already exists');
    } finally {
      Customer.findOne = originalFindOne;
    }
  });

  await runTest('Registers new customer successfully (201) and excludes password', async () => {
    const originalFindOne = Customer.findOne;
    const originalSave = Customer.prototype.save;

    Customer.findOne = async () => null;
    Customer.prototype.save = async function () {
      this._id = 'mock-id-new-user';
      return this;
    };

    const req = {
      body: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'securepassword',
        phone: '9876543210',
      },
    };
    const res = createMockRes();

    try {
      await registerCustomer(req, res);
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Customer registered successfully');
      assert.ok(res.body.customer);
      assert.strictEqual(res.body.customer.fullName, 'Jane Doe');
      assert.strictEqual(res.body.customer.email, 'jane@example.com');
      assert.strictEqual(res.body.customer.password, undefined, 'Password must NEVER be returned in response');
    } finally {
      Customer.findOne = originalFindOne;
      Customer.prototype.save = originalSave;
    }
  });

  console.log('\n--- 3. Testing Customer Login (Task 2) ---');
  await runTest('Rejects login without email or password with 400', async () => {
    const req = { body: { email: 'jane@example.com' } };
    const res = createMockRes();

    await loginCustomer(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
  });

  await runTest('Returns 401 Invalid credentials for non-existent email', async () => {
    const originalFindOne = Customer.findOne;
    Customer.findOne = async () => null;

    const req = { body: { email: 'unknown@example.com', password: 'anypassword' } };
    const res = createMockRes();

    try {
      await loginCustomer(req, res);
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Invalid credentials');
    } finally {
      Customer.findOne = originalFindOne;
    }
  });

  await runTest('Returns 401 Invalid credentials for wrong password', async () => {
    const originalFindOne = Customer.findOne;
    Customer.findOne = async () => ({
      _id: 'cust-id-1',
      comparePassword: async () => false,
    });

    const req = { body: { email: 'jane@example.com', password: 'wrongpassword' } };
    const res = createMockRes();

    try {
      await loginCustomer(req, res);
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Invalid credentials');
    } finally {
      Customer.findOne = originalFindOne;
    }
  });

  await runTest('Logs in successfully (200), sets HttpOnly cookie and does not expose password', async () => {
    const originalFindOne = Customer.findOne;
    Customer.findOne = async () => ({
      _id: 'cust-id-1',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '9876543210',
      comparePassword: async () => true,
    });

    const req = { body: { email: 'jane@example.com', password: 'correctpassword' } };
    const res = createMockRes();

    try {
      await loginCustomer(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Login successful');
      assert.ok(res.cookies.token, 'Cookie must be set on login');
      assert.strictEqual(res.cookies.token.options.httpOnly, true);
      if (res.body.customer) {
        assert.strictEqual(res.body.customer.password, undefined, 'Password must never be returned');
      }
    } finally {
      Customer.findOne = originalFindOne;
    }
  });

  console.log('\n--- 4. Testing Auth Middleware & Profile (Task 3) ---');
  await runTest('protectRoute returns 401 when no token is in cookies', async () => {
    const req = { cookies: {} };
    const res = createMockRes();
    let nextCalled = false;

    await protectRoute(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(nextCalled, false);
    assert.ok(res.body.message.includes('Unauthorized'));
  });

  await runTest('protectRoute returns 401 for invalid JWT', async () => {
    const req = { cookies: { token: 'malformed.jwt.token' } };
    const res = createMockRes();
    let nextCalled = false;

    await protectRoute(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(nextCalled, false);
  });

  await runTest('protectRoute attaches customer to req.user on valid token', async () => {
    const token = jwt.sign({ id: 'valid-cust-id' }, process.env.JWT_SECRET);
    const originalFindById = Customer.findById;

    Customer.findById = (id) => ({
      select: (fields) => ({
        _id: id,
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
      }),
    });

    const req = { cookies: { token } };
    const res = createMockRes();
    let nextCalled = false;

    try {
      await protectRoute(req, res, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, true);
      assert.ok(req.user);
      assert.strictEqual(req.user._id, 'valid-cust-id');
      assert.strictEqual(req.user.fullName, 'John Doe');
      assert.strictEqual(req.user.password, undefined);
    } finally {
      Customer.findById = originalFindById;
    }
  });

  await runTest('GET /customers/me returns authenticated profile without password', async () => {
    const req = {
      user: {
        _id: 'user-id-123',
        fullName: 'John Doe',
        email: 'john@gmail.com',
        phone: '9876543210',
      },
    };
    const res = createMockRes();

    await getProfile(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body._id, 'user-id-123');
    assert.strictEqual(res.body.fullName, 'John Doe');
    assert.strictEqual(res.body.email, 'john@gmail.com');
    assert.strictEqual(res.body.phone, '9876543210');
    assert.strictEqual(res.body.password, undefined);
  });

  console.log('\n--- 5. Testing Logout (Task 4) ---');
  await runTest('POST /customers/logout clears cookie and returns 200', async () => {
    const req = {};
    const res = createMockRes();
    res.cookies.token = { val: 'some-token' };

    await logoutCustomer(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.message, 'Logged out successfully');
    assert.ok(res.clearedCookie);
    assert.strictEqual(res.clearedCookie.name, 'token');
  });

  console.log('\n--- 6. Testing Change Password (Bonus Challenge) ---');
  await runTest('Rejects change password if oldPassword or newPassword is missing', async () => {
    const req = { user: { _id: 'user-1' }, body: { oldPassword: 'old' } };
    const res = createMockRes();

    await changePassword(req, res);
    assert.strictEqual(res.statusCode, 400);
  });

  await runTest('Rejects change password if newPassword < 6 chars', async () => {
    const req = { user: { _id: 'user-1' }, body: { oldPassword: 'oldPass123', newPassword: '123' } };
    const res = createMockRes();

    await changePassword(req, res);
    assert.strictEqual(res.statusCode, 400);
  });

  await runTest('Rejects change password if old password does not match', async () => {
    const originalFindById = Customer.findById;
    Customer.findById = async () => ({
      comparePassword: async () => false,
    });

    const req = {
      user: { _id: 'user-1' },
      body: { oldPassword: 'wrongOldPassword', newPassword: 'newPassword123' },
    };
    const res = createMockRes();

    try {
      await changePassword(req, res);
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.message, 'Incorrect old password');
    } finally {
      Customer.findById = originalFindById;
    }
  });

  await runTest('Changes password successfully with valid old and new passwords', async () => {
    const originalFindById = Customer.findById;
    let saved = false;
    Customer.findById = async () => ({
      password: 'hashed-old-password',
      comparePassword: async () => true,
      save: async function () {
        saved = true;
        return this;
      },
    });

    const req = {
      user: { _id: 'user-1' },
      body: { oldPassword: 'correctOldPassword', newPassword: 'brandNewPassword123' },
    };
    const res = createMockRes();

    try {
      await changePassword(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Password changed successfully');
      assert.strictEqual(saved, true);
    } finally {
      Customer.findById = originalFindById;
    }
  });

  console.log('\n--- 7. Testing Product Creation (Task 2) ---');
  await runTest('Rejects create product with missing fields with 400', async () => {
    const req = { body: { name: 'Keyboard', price: 2999 } }; // missing description, category, image, stock
    const res = createMockRes();

    await createProduct(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Missing required field'));
  });

  await runTest('Rejects create product with invalid price (<= 0) with 400', async () => {
    const req = {
      body: {
        name: 'Keyboard',
        description: 'Test keyboard',
        price: -500,
        category: 'Electronics',
        image: 'http://example.com/img.jpg',
        stock: 5,
      },
    };
    const res = createMockRes();

    await createProduct(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Invalid price'));
  });

  await runTest('Rejects create product with negative stock with 400', async () => {
    const req = {
      body: {
        name: 'Keyboard',
        description: 'Test keyboard',
        price: 2999,
        category: 'Electronics',
        image: 'http://example.com/img.jpg',
        stock: -1,
      },
    };
    const res = createMockRes();

    await createProduct(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Invalid stock'));
  });

  await runTest('Creates product successfully (201)', async () => {
    const originalSave = Product.prototype.save;
    Product.prototype.save = async function () {
      this._id = 'mock-product-id-123';
      return this;
    };

    const req = {
      body: {
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard with blue switches.',
        price: 2999,
        category: 'Electronics',
        image: 'https://example.com/keyboard.jpg',
        stock: 10,
      },
    };
    const res = createMockRes();

    try {
      await createProduct(req, res);
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Product created successfully');
      assert.ok(res.body.product);
      assert.strictEqual(res.body.product.name, 'Mechanical Keyboard');
      assert.strictEqual(res.body.product.price, 2999);
    } finally {
      Product.prototype.save = originalSave;
    }
  });

  console.log('\n--- 8. Testing Get Products, Search, Filter & Sort (Tasks 3, 5 & Bonus) ---');
  await runTest('GET /products returns list and count (200)', async () => {
    const mockList = [
      { _id: '1', name: 'Keyboard', price: 2999, category: 'Electronics' },
      { _id: '2', name: 'Headphones', price: 4999, category: 'Electronics' },
    ];
    const originalFind = Product.find;
    Product.find = () => ({
      sort: () => ({
        select: async () => mockList,
      }),
    });

    const req = { query: {} };
    const res = createMockRes();

    try {
      await getAllProducts(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.count, 2);
      assert.strictEqual(res.body.products.length, 2);
    } finally {
      Product.find = originalFind;
    }
  });

  await runTest('GET /products with search and category builds query filter correctly', async () => {
    let capturedQuery = null;
    let capturedSort = null;
    const originalFind = Product.find;

    Product.find = (query) => {
      capturedQuery = query;
      return {
        sort: (sortCriteria) => {
          capturedSort = sortCriteria;
          return {
            select: async () => [
              { _id: '1', name: 'Mechanical Keyboard', price: 2999, category: 'Electronics' },
            ],
          };
        },
      };
    };

    const req = {
      query: {
        search: 'keyboard',
        category: 'Electronics',
        sort: 'price_asc',
      },
    };
    const res = createMockRes();

    try {
      await getAllProducts(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.ok(capturedQuery.name.$regex);
      assert.strictEqual(capturedQuery.name.$options, 'i');
      assert.ok(capturedQuery.category.$regex);
      assert.strictEqual(capturedSort.price, 1, 'Sort should be ascending price');
    } finally {
      Product.find = originalFind;
    }
  });

  console.log('\n--- 9. Testing Get Single Product (Task 4) ---');
  await runTest('GET /products/:id rejects invalid ObjectId format with 400', async () => {
    const req = { params: { id: 'invalid-id' } };
    const res = createMockRes();

    await getProductById(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Invalid product ID'));
  });

  await runTest('GET /products/:id returns 404 when product is not found', async () => {
    const originalFindById = Product.findById;
    Product.findById = async () => null;

    const validId = '507f1f77bcf86cd799439011';
    const req = { params: { id: validId } };
    const res = createMockRes();

    try {
      await getProductById(req, res);
      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Product not found');
    } finally {
      Product.findById = originalFindById;
    }
  });

  await runTest('GET /products/:id returns product details (200)', async () => {
    const validId = '507f1f77bcf86cd799439011';
    const originalFindById = Product.findById;
    Product.findById = async () => ({
      _id: validId,
      name: 'Wireless Mouse',
      price: 1499,
      category: 'Electronics',
      stock: 20,
    });

    const req = { params: { id: validId } };
    const res = createMockRes();

    try {
      await getProductById(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.product._id, validId);
      assert.strictEqual(res.body.product.name, 'Wireless Mouse');
    } finally {
      Product.findById = originalFindById;
    }
  });

  console.log('\n--- 10. Testing Wishlist Schema & Model (Lab 04 Task 1) ---');
  await runTest('Customer schema contains wishlist field referencing Product with default []', async () => {
    const wishlistPath = Customer.schema.path('wishlist');
    assert.ok(wishlistPath, 'Customer schema must define a wishlist field');
    assert.strictEqual(wishlistPath.instance, 'Array', 'wishlist must be an Array');
    assert.strictEqual(wishlistPath.caster.options.ref, 'Product', 'wishlist items must ref "Product"');
  });

  console.log('\n--- 11. Testing Add Product to Wishlist (Lab 04 Task 2) ---');
  await runTest('POST /wishlist/:productId rejects invalid ObjectId with 400', async () => {
    const req = {
      params: { productId: 'invalid-id' },
      user: { _id: '507f1f77bcf86cd799439011' },
    };
    const res = createMockRes();

    await addToWishlist(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Invalid product ID'));
  });

  await runTest('POST /wishlist/:productId returns 404 when product not found', async () => {
    const validProductId = new mongoose.Types.ObjectId().toString();
    const originalFindById = Product.findById;
    Product.findById = async () => null;

    const req = {
      params: { productId: validProductId },
      user: { _id: '507f1f77bcf86cd799439011' },
    };
    const res = createMockRes();

    try {
      await addToWishlist(req, res);
      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Product not found');
    } finally {
      Product.findById = originalFindById;
    }
  });

  await runTest('POST /wishlist/:productId returns 409 Conflict if product already in wishlist', async () => {
    const validProductId = new mongoose.Types.ObjectId().toString();
    const originalFindProduct = Product.findById;
    const originalFindCustomer = Customer.findById;

    Product.findById = async () => ({ _id: validProductId, name: 'Sample Keyboard' });
    Customer.findById = async () => ({
      _id: '507f1f77bcf86cd799439011',
      wishlist: [new mongoose.Types.ObjectId(validProductId)],
    });

    const req = {
      params: { productId: validProductId },
      user: { _id: '507f1f77bcf86cd799439011' },
    };
    const res = createMockRes();

    try {
      await addToWishlist(req, res);
      assert.strictEqual(res.statusCode, 409);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Product already in wishlist');
    } finally {
      Product.findById = originalFindProduct;
      Customer.findById = originalFindCustomer;
    }
  });

  await runTest('POST /wishlist/:productId saves ObjectId reference and returns 200', async () => {
    const validProductId = new mongoose.Types.ObjectId().toString();
    const originalFindProduct = Product.findById;
    const originalFindCustomer = Customer.findById;
    let saved = false;

    Product.findById = async () => ({ _id: validProductId, name: 'Sample Keyboard' });
    Customer.findById = async () => ({
      _id: '507f1f77bcf86cd799439011',
      wishlist: [],
      save: async function () {
        saved = true;
        return this;
      },
    });

    const req = {
      params: { productId: validProductId },
      user: { _id: '507f1f77bcf86cd799439011' },
    };
    const res = createMockRes();

    try {
      await addToWishlist(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Product added to wishlist');
      assert.strictEqual(saved, true);
    } finally {
      Product.findById = originalFindProduct;
      Customer.findById = originalFindCustomer;
    }
  });

  console.log('\n--- 12. Testing Get Current User Wishlist with populate() (Lab 04 Task 3) ---');
  await runTest('GET /wishlist returns populated product references and count', async () => {
    const originalFindCustomer = Customer.findById;
    const populatedMockItems = [
      {
        _id: '507f1f77bcf86cd799439012',
        name: 'Mechanical Keyboard',
        price: 2999,
        category: 'Electronics',
        image: 'https://example.com/keyboard.jpg',
        stock: 10,
      },
      {
        _id: '507f1f77bcf86cd799439013',
        name: 'Wireless Headphones',
        price: 4999,
        category: 'Electronics',
        image: 'https://example.com/headphones.jpg',
        stock: 5,
      },
    ];

    Customer.findById = (userId) => ({
      populate: async (options) => {
        assert.strictEqual(options.path, 'wishlist', 'populate must target "wishlist"');
        return {
          _id: userId,
          wishlist: populatedMockItems,
        };
      },
    });

    const req = { user: { _id: '507f1f77bcf86cd799439011' } };
    const res = createMockRes();

    try {
      await getWishlist(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.count, 2);
      assert.strictEqual(res.body.wishlist.length, 2);
      assert.strictEqual(res.body.wishlist[0].name, 'Mechanical Keyboard');
    } finally {
      Customer.findById = originalFindCustomer;
    }
  });

  console.log('\n--- 13. Testing Remove Product from Wishlist (Lab 04 Task 4) ---');
  await runTest('DELETE /wishlist/:productId rejects invalid ObjectId with 400', async () => {
    const req = {
      params: { productId: 'not-valid' },
      user: { _id: '507f1f77bcf86cd799439011' },
    };
    const res = createMockRes();

    await removeFromWishlist(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
  });

  await runTest('DELETE /wishlist/:productId returns 404 when product not in wishlist', async () => {
    const validProductId = new mongoose.Types.ObjectId().toString();
    const otherId = new mongoose.Types.ObjectId().toString();
    const originalFindCustomer = Customer.findById;

    Customer.findById = async () => ({
      _id: '507f1f77bcf86cd799439011',
      wishlist: [otherId],
    });

    const req = {
      params: { productId: validProductId },
      user: { _id: '507f1f77bcf86cd799439011' },
    };
    const res = createMockRes();

    try {
      await removeFromWishlist(req, res);
      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Product not in wishlist');
    } finally {
      Customer.findById = originalFindCustomer;
    }
  });

  await runTest('DELETE /wishlist/:productId removes product reference and returns 200', async () => {
    const validProductId = new mongoose.Types.ObjectId().toString();
    const originalFindCustomer = Customer.findById;
    let saved = false;

    Customer.findById = async () => ({
      _id: '507f1f77bcf86cd799439011',
      wishlist: [new mongoose.Types.ObjectId(validProductId)],
      save: async function () {
        saved = true;
        return this;
      },
    });

    const req = {
      params: { productId: validProductId },
      user: { _id: '507f1f77bcf86cd799439011' },
    };
    const res = createMockRes();

    try {
      await removeFromWishlist(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Product removed from wishlist');
      assert.strictEqual(saved, true);
    } finally {
      Customer.findById = originalFindCustomer;
    }
  });

  console.log('\n--- 14. Testing Wishlist Toggle (Bonus Challenge +10 Marks) ---');
  await runTest('PATCH /wishlist/:productId/toggle adds when absent and removes when present', async () => {
    const validProductId = new mongoose.Types.ObjectId().toString();
    const originalFindProduct = Product.findById;
    const originalFindCustomer = Customer.findById;

    Product.findById = async () => ({ _id: validProductId });

    // 1st call: Add
    let userMock = {
      _id: '507f1f77bcf86cd799439011',
      wishlist: [],
      save: async function () { return this; },
    };
    Customer.findById = async () => userMock;

    const req = {
      params: { productId: validProductId },
      user: { _id: '507f1f77bcf86cd799439011' },
    };
    let res = createMockRes();

    try {
      await toggleWishlist(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.saved, true);
      assert.strictEqual(res.body.message, 'Product added to wishlist');

      // 2nd call: Remove
      res = createMockRes();
      await toggleWishlist(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.saved, false);
      assert.strictEqual(res.body.message, 'Product removed from wishlist');
    } finally {
      Product.findById = originalFindProduct;
      Customer.findById = originalFindCustomer;
    }
  });

  console.log('\n--- 15. Testing Authorization Header Support in Middleware ---');
  await runTest('protectRoute accepts Authorization: Bearer <token>', async () => {
    const token = jwt.sign({ id: 'valid-cust-id' }, process.env.JWT_SECRET);
    const originalFindById = Customer.findById;

    Customer.findById = (id) => ({
      select: () => ({
        _id: id,
        fullName: 'Bearer User',
        email: 'bearer@example.com',
      }),
    });

    const req = {
      cookies: {},
      headers: { authorization: `Bearer ${token}` },
    };
    const res = createMockRes();
    let nextCalled = false;

    try {
      await protectRoute(req, res, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, true);
      assert.ok(req.user);
      assert.strictEqual(req.user.fullName, 'Bearer User');
    } finally {
      Customer.findById = originalFindById;
    }
  });

  console.log('\n=============================================');
  console.log(`TEST SUMMARY: ${testsPassed} passed, ${testsFailed} failed`);
  console.log('=============================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
