import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut, LogIn, UserPlus, Grid } from 'lucide-react';
import { logoutCustomer } from '../services/api';

const Navbar = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.warn('Logout error (clearing local session anyway):', err.message);
    } finally {
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
          {/* Products Catalog Link always accessible */}
          <NavLink
            to="/products"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Grid size={16} />
              <span>Products</span>
            </div>
          </NavLink>

          {currentUser ? (
            <>
              <NavLink
                to="/home"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Home
              </NavLink>

              <div className="user-badge" title={currentUser.email}>
                <div className="user-avatar">
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-name">{currentUser.fullName || 'Customer'}</span>
              </div>

              {/* Task 4: Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="btn-logout"
                title="Logout of your account"
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
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <LogIn size={16} />
                  <span>Login</span>
                </div>
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
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
