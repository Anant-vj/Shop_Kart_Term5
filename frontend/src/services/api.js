import axios from 'axios';

/**
 * Axios instance configured for ShopKart authentication.
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

/**
 * Task 1: Register a new customer
 * @param {Object} customerData - { fullName, email, password, phone }
 * @returns {Promise<Object>} API response data
 */
export const registerCustomer = async (customerData) => {
  const response = await api.post('/customers/register', customerData);
  return response.data;
};

/**
 * Task 2: Log in customer and receive HttpOnly session cookie
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} API response data
 */
export const loginCustomer = async (credentials) => {
  const response = await api.post('/customers/login', credentials);
  return response.data;
};

/**
 * Task 3: Fetch authenticated customer profile using cookie
 * @returns {Promise<Object>} Customer profile { _id, fullName, email, phone }
 */
export const getProfile = async () => {
  const response = await api.get('/customers/me');
  return response.data;
};

/**
 * Task 4: Log out customer and clear the HttpOnly session cookie
 * @returns {Promise<Object>} API response data
 */
export const logoutCustomer = async () => {
  const response = await api.post('/customers/logout');
  return response.data;
};

export default api;
