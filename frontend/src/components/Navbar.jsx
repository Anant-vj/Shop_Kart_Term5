import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut, LogIn, UserPlus, Grid, Heart, ShoppingCart } from 'lucide-react';
import { logoutCustomer } from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = ({ currentUser, onLogout, wishlistCount = 0 }) => {
  const navigate = useNavigate();
  const { totalQuantity, clearCartState } = useCart();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.warn('Logout error (clearing local session anyway):', err.message);
    } finally {
      clearCartState();
      if (onLogout) onLogout();
      navigate('/login');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/home" className="nav-brand">
          <div className="brand-icon">
            <ShoppingBag size={20} />
          </div>
          <span>ShopKart</span>
          <span className="brand-badge">Customer Portal</span>
        </Link>

        {/* Navigation Actions */}
        <nav className="nav-actions">
          {currentUser && (
            <NavLink
              to="/home"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              id="nav-home-link"
            >
              Home
            </NavLink>
          )}

          {/* Products Catalog Link always accessible */}
          <NavLink
            to="/products"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            id="nav-products-link"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Grid size={16} />
              <span>Products</span>
            </div>
          </NavLink>

          {/* Task 8 + Bonus: Wishlist Navigation Link with Dynamic Count */}
          <NavLink
            to="/wishlist"
            className={({ isActive }) => `nav-link nav-wishlist-link ${isActive ? 'active' : ''}`}
            id="nav-wishlist-link"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Heart size={16} className="nav-heart-icon" />
              <span>
                Wishlist
                {currentUser && wishlistCount > 0 && ` (${wishlistCount})`}
              </span>
              {currentUser && wishlistCount > 0 && (
                <span className="nav-count-badge" id="nav-wishlist-badge">
                  {wishlistCount}
                </span>
              )}
            </div>
          </NavLink>

          {/* Task 8 & 16: Shopping Cart Navigation Link with Dynamic Count */}
          <NavLink
            to="/cart"
            className={({ isActive }) => `nav-link nav-cart-link ${isActive ? 'active' : ''}`}
            id="nav-cart-link"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShoppingCart size={16} className="nav-cart-icon" />
              <span>
                Cart
                {currentUser && totalQuantity > 0 && ` (${totalQuantity})`}
              </span>
              {currentUser && totalQuantity > 0 && (
                <span className="nav-count-badge nav-cart-badge" id="nav-cart-badge">
                  {totalQuantity}
                </span>
              )}
            </div>
          </NavLink>

          {currentUser ? (
            <>
              <div className="user-badge" title={currentUser.email}>
                <div className="user-avatar">
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-name">{currentUser.fullName || 'Customer'}</span>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="btn-logout"
                title="Logout of your account"
                id="btn-logout"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                id="nav-login-link"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <LogIn size={16} />
                  <span>Login</span>
                </div>
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                id="nav-register-link"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <UserPlus size={16} />
                  <span>Register</span>
                </div>
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
