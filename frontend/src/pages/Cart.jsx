import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, ArrowRight, ShieldCheck, Truck, RefreshCw, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = ({ currentUser }) => {
  const navigate = useNavigate();
  const { cartItems, cartLoading, cartError, refreshCart, subtotal, totalQuantity, uniqueItemsCount } = useCart();
  const handleCheckout = () => {
    navigate('/checkout');
  };

  const deliveryThreshold = 999;
  const isFreeDelivery = subtotal >= deliveryThreshold || subtotal === 0;
  const deliveryFee = isFreeDelivery ? 0 : 99;
  const grandTotal = subtotal + deliveryFee;

  // 1. Loading State
  if (cartLoading) {
    return (
      <div className="cart-page-container">
        <div className="cart-state-container loading-state" role="status">
          <div className="spinner-large">
            <Loader2 size={40} className="spinner-icon" />
          </div>
          <h2 className="state-title">Loading your cart...</h2>
          <p className="state-subtitle">Fetching your saved cart items from ShopKart...</p>
          <div className="cart-skeleton-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="cart-skeleton-item">
                <div className="skeleton-thumb"></div>
                <div className="skeleton-details">
                  <div className="skeleton-line" style={{ width: '60%' }}></div>
                  <div className="skeleton-line" style={{ width: '30%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!currentUser) {
    return (
      <div className="cart-page-container">
        <div className="cart-state-container error-state" role="alert">
          <div className="error-icon-box">
            <AlertCircle size={48} />
          </div>
          <h2 className="state-title">Authentication Required</h2>
          <p className="state-subtitle">
            Please log in to your account to view your cart and proceed to checkout.
          </p>
          <div className="state-actions">
            <Link to="/login" className="btn-primary-action">
              <span>Go to Login</span>
            </Link>
            <Link to="/products" className="btn-secondary-action">
              <span>Browse Products</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Error State
  if (cartError) {
    return (
      <div className="cart-page-container">
        <div className="cart-state-container error-state" role="alert">
          <div className="error-icon-box">
            <AlertCircle size={48} />
          </div>
          <h2 className="state-title">Unable to load your cart.</h2>
          <p className="state-subtitle">{cartError}</p>
          <div className="state-actions">
            <button
              type="button"
              onClick={refreshCart}
              className="btn-retry"
              id="cart-retry-btn"
            >
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>
            <Link to="/products" className="btn-secondary-action">
              <span>Browse Products</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Empty State (Section 17)
  if (cartItems.length === 0) {
    return (
      <div className="cart-page-container">
        <div className="cart-state-container empty-state">
          <div className="empty-cart-icon">🛒</div>
          <h2 className="state-title">Your cart is empty</h2>
          <p className="state-subtitle">
            Looks like you haven't added anything yet.
          </p>
          <Link
            to="/products"
            className="btn-browse-products"
            id="cart-browse-btn"
          >
            <ShoppingCart size={18} />
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    );
  }

  // 5. Active Cart View
  return (
    <div className="cart-page-container">
      {/* Header Bar */}
      <div className="cart-page-header">
        <div className="cart-header-left">
          <h1 className="cart-page-title">My Cart</h1>
          <span className="cart-header-count">
            {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} ({uniqueItemsCount} unique {uniqueItemsCount === 1 ? 'product' : 'products'})
          </span>
        </div>

        <Link to="/products" className="btn-continue-shopping">
          <ArrowLeft size={16} />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Main Grid: Cart Items List + Order Summary */}
      <div className="cart-layout-grid">
        {/* Left Column: Items */}
        <section className="cart-items-section" aria-label="Shopping Cart Items">
          <div className="cart-items-list" id="cart-items-list">
            {cartItems.map((item) => (
              <CartItem key={item.product._id || item.product} item={item} />
            ))}
          </div>

          <div className="cart-trust-badges">
            <div className="trust-badge-item">
              <ShieldCheck size={18} />
              <span>100% Secure Checkout with Encrypted Data</span>
            </div>
            <div className="trust-badge-item">
              <Truck size={18} />
              <span>Free Delivery on all orders over ₹999</span>
            </div>
          </div>
        </section>

        {/* Right Column: Order Summary (Section 13) */}
        <aside className="order-summary-card" aria-label="Order Summary">
          <h2 className="order-summary-title">Order Summary</h2>

          <div className="summary-breakdown">
            <div className="summary-row">
              <span className="summary-label">Items ({totalQuantity}):</span>
              <span className="summary-value">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="summary-row">
              <span className="summary-label">Delivery:</span>
              <span className="summary-value delivery-value">
                {isFreeDelivery ? (
                  <span className="text-free">FREE</span>
                ) : (
                  `₹${deliveryFee}`
                )}
              </span>
            </div>

            {!isFreeDelivery && (
              <div className="delivery-upsell-notice">
                Add <strong>₹{(deliveryThreshold - subtotal).toLocaleString('en-IN')}</strong> more for FREE delivery!
              </div>
            )}

            <div className="summary-divider"></div>

            <div className="summary-row total-row">
              <span className="total-label">Subtotal</span>
              <span className="total-value" id="cart-subtotal-amount">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="summary-row grand-total-row">
              <span className="total-label">Estimated Total</span>
              <span className="total-value" id="cart-total-amount">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <p className="summary-tax-note">Inclusive of all applicable GST taxes</p>
          </div>

          <button
            type="button"
            className="btn-proceed-checkout"
            onClick={handleCheckout}
            id="btn-proceed-checkout"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
