import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import { CartProvider } from './context/CartContext';
import { getProfile, getWishlist } from './services/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Sync wishlist count from backend when authenticated
  const refreshWishlistCount = useCallback(async () => {
    try {
      const data = await getWishlist();
      if (data && typeof data.count === 'number') {
        setWishlistCount(data.count);
      } else if (Array.isArray(data.wishlist)) {
        setWishlistCount(data.wishlist.length);
      }
    } catch (err) {
      // If unauthenticated, reset to 0
      setWishlistCount(0);
    }
  }, []);

  // Check initial login status when the app loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getProfile();
        setCurrentUser(user);
        await refreshWishlistCount();
      } catch (err) {
        // Not logged in or expired cookie
        setCurrentUser(null);
        setWishlistCount(0);
      }
    };
    checkAuth();
  }, [refreshWishlistCount]);

  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    await refreshWishlistCount();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setWishlistCount(0);
  };

  const handleWishlistChange = (newCount) => {
    if (typeof newCount === 'number') {
      setWishlistCount(newCount);
    } else {
      refreshWishlistCount();
    }
  };

  return (
    <BrowserRouter>
      <CartProvider currentUser={currentUser}>
        <div className="app-layout">
          <Navbar
            currentUser={currentUser}
            onLogout={handleLogout}
            wishlistCount={wishlistCount}
          />
          <main>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
              <Route
                path="/home"
                element={<Home onUserLoaded={(user) => setCurrentUser(user)} />}
              />

              {/* Product Catalog & Details Routes */}
              <Route
                path="/products"
                element={<Products onWishlistCountChange={handleWishlistChange} />}
              />
              <Route
                path="/products/:id"
                element={<ProductDetails onWishlistCountChange={handleWishlistChange} />}
              />

              {/* Wishlist Route */}
              <Route
                path="/wishlist"
                element={<Wishlist onWishlistUpdate={handleWishlistChange} />}
              />

              {/* Lab 05: Shopping Cart Route */}
              <Route
                path="/cart"
                element={<Cart currentUser={currentUser} />}
              />

              {/* Default Route redirects to /products or /home */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              {/* Catch-all unknown routes */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
