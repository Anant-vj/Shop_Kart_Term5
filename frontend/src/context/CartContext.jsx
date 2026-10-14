import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartQuantity as apiUpdateQuantity, removeFromCart as apiRemoveFromCart } from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children, currentUser }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [actionLoadingMap, setActionLoadingMap] = useState({});

  // Fetch authenticated user's cart from backend
  const refreshCart = useCallback(async () => {
    if (!currentUser) {
      setCartItems([]);
      setCartLoading(false);
      setCartError(null);
      return;
    }

    setCartLoading(true);
    setCartError(null);

    try {
      const data = await getCart();
      if (data && Array.isArray(data.cart)) {
        // Filter out null or missing product references
        const validItems = data.cart.filter((item) => item && item.product);
        setCartItems(validItems);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setCartItems([]);
      } else {
        console.error('Error loading cart from server:', err);
        setCartError(err.response?.data?.message || 'Unable to load your cart.');
      }
    } finally {
      setCartLoading(false);
    }
  }, [currentUser]);

  // Synchronize cart when currentUser changes
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Helper to set individual action loading for a specific product ID
  const setItemLoading = (productId, isLoading) => {
    setActionLoadingMap((prev) => ({
      ...prev,
      [productId]: isLoading,
    }));
  };

  /**
   * Add product to cart (or increment quantity if already present)
   */
  const addToCart = async (productId) => {
    setItemLoading(productId, true);
    try {
      const data = await apiAddToCart(productId);
      if (data && Array.isArray(data.cart)) {
        const validItems = data.cart.filter((item) => item && item.product);
        setCartItems(validItems);
      }
      return { success: true, message: data.message || 'Product added to cart' };
    } catch (err) {
      console.error('Error adding product to cart:', err);
      const msg = err.response?.data?.message || 'Unable to add product to cart.';
      throw new Error(msg);
    } finally {
      setItemLoading(productId, false);
    }
  };

  /**
   * Update quantity of an item in the cart
   */
  const updateQuantity = async (productId, newQuantity) => {
    setItemLoading(productId, true);
    try {
      const data = await apiUpdateQuantity(productId, newQuantity);
      if (data && Array.isArray(data.cart)) {
        const validItems = data.cart.filter((item) => item && item.product);
        setCartItems(validItems);
      }
      return { success: true, message: data.message || 'Cart updated' };
    } catch (err) {
      console.error('Error updating cart quantity:', err);
      const msg = err.response?.data?.message || 'Unable to update quantity.';
      throw new Error(msg);
    } finally {
      setItemLoading(productId, false);
    }
  };

  /**
   * Remove product from cart
   */
  const removeFromCart = async (productId) => {
    setItemLoading(productId, true);
    try {
      const data = await apiRemoveFromCart(productId);
      if (data && Array.isArray(data.cart)) {
        const validItems = data.cart.filter((item) => item && item.product);
        setCartItems(validItems);
      } else {
        setCartItems((prev) =>
          prev.filter((item) => (item.product?._id || item.product) !== productId)
        );
      }
      return { success: true, message: data.message || 'Item removed from cart' };
    } catch (err) {
      console.error('Error removing item from cart:', err);
      const msg = err.response?.data?.message || 'Unable to remove item from cart.';
      throw new Error(msg);
    } finally {
      setItemLoading(productId, false);
    }
  };

  /**
   * Clear local cart state (e.g. on logout)
   */
  const clearCartState = () => {
    setCartItems([]);
    setCartError(null);
    setActionLoadingMap({});
  };

  // Section 15: Derived Cart Values
  // 1. Total Quantity (used for Navbar badge: "Cart (3)" where Keyboard x 2, Mouse x 1 = 3)
  const totalQuantity = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  }, [cartItems]);

  // 2. Subtotal: Σ(product.price × quantity)
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = Number(item.product?.price) || 0;
      const qty = Number(item.quantity) || 0;
      return acc + price * qty;
    }, 0);
  }, [cartItems]);

  // 3. Unique items count in cart
  const uniqueItemsCount = cartItems.length;

  // 4. Helper to check if a product is in cart and return its quantity
  const getItemQuantity = useCallback(
    (productId) => {
      const found = cartItems.find(
        (item) => (item.product?._id || item.product)?.toString() === productId?.toString()
      );
      return found ? found.quantity : 0;
    },
    [cartItems]
  );

  const value = {
    cartItems,
    cartLoading,
    cartError,
    actionLoadingMap,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
    clearCartState,
    totalQuantity,
    subtotal,
    uniqueItemsCount,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
