import axios from 'axios';

/**
 * Axios instance configured for ShopKart.
 * withCredentials: true ensures HttpOnly cookies (containing the JWT)
 * are automatically sent with cross-origin requests and stored upon responses.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ==========================================================================
   Customer Authentication API Calls (Labs 01 & 02)
   ========================================================================== */

/**
 * Register a new customer
 * @param {Object} customerData - { fullName, email, password, phone }
 */
export const registerCustomer = async (customerData) => {
  const response = await api.post('/customers/register', customerData);
  return response.data;
};

/**
 * Log in customer and receive HttpOnly session cookie
 * @param {Object} credentials - { email, password }
 */
export const loginCustomer = async (credentials) => {
  const response = await api.post('/customers/login', credentials);
  return response.data;
};

/**
 * Fetch authenticated customer profile using cookie
 */
export const getProfile = async () => {
  const response = await api.get('/customers/me');
  return response.data;
};

/**
 * Log out customer and clear the HttpOnly session cookie
 */
export const logoutCustomer = async () => {
  const response = await api.post('/customers/logout');
  return response.data;
};

/* ==========================================================================
   Product Catalog & Discovery API Calls (Lab 03)
   ========================================================================== */

/**
 * Fetch products with optional search, category filter, and sorting
 * @param {Object} params - { search, category, sort }
 * @returns {Promise<Object>} { success, count, products }
 */
export const fetchProducts = async (params = {}) => {
  const queryParams = {};
  if (params.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }
  if (
    params.category &&
    params.category.trim() &&
    !['all', 'all categories'].includes(params.category.trim().toLowerCase())
  ) {
    queryParams.category = params.category.trim();
  }
  if (params.sort && params.sort.trim()) {
    queryParams.sort = params.sort.trim();
  }

  const response = await api.get('/products', { params: queryParams });
  return response.data;
};

/**
 * Fetch single product details by MongoDB ObjectId
 * @param {string} id - Product ObjectId
 * @returns {Promise<Object>} { success, product }
 */
export const fetchProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

/**
 * Create a new product (Task 2)
 * @param {Object} productData - { name, description, price, category, image, stock }
 * @returns {Promise<Object>} { success, product }
 */
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

/* ==========================================================================
   Wishlist API Calls (Lab 04)
   ========================================================================== */

/**
 * Task 2: Add product to current customer's wishlist
 * @param {string} productId - Product ObjectId
 * @returns {Promise<Object>} { success, message, count }
 */
export const addToWishlist = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  return response.data;
};

/**
 * Task 3: Fetch current customer's wishlist with populated product references
 * @returns {Promise<Object>} { success, count, wishlist }
 */
export const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

/**
 * Task 4: Remove product from current customer's wishlist
 * @param {string} productId - Product ObjectId
 * @returns {Promise<Object>} { success, message, count }
 */
export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

/**
 * Bonus: Toggle product in wishlist (adds if absent, removes if present)
 * @param {string} productId - Product ObjectId
 * @returns {Promise<Object>} { success, saved, message, count }
 */
export const toggleWishlist = async (productId) => {
  const response = await api.patch(`/wishlist/${productId}/toggle`);
  return response.data;
};

export default api;
