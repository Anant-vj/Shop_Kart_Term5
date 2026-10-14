import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, RefreshCw, AlertCircle, ShoppingBag, Loader2 } from 'lucide-react';
import WishlistCard from '../components/WishlistCard';
import { getWishlist } from '../services/api';

const Wishlist = ({ onWishlistUpdate }) => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthError, setIsAuthError] = useState(false);

  // Fetch wishlist from backend
  const loadWishlist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsAuthError(false);

    try {
      const data = await getWishlist();
      const items = Array.isArray(data.wishlist) ? data.wishlist : [];
      setWishlist(items);
      if (onWishlistUpdate) {
        onWishlistUpdate(items.length);
      }
    } catch (err) {
      console.error('Error loading wishlist:', err);
      const status = err.response?.status;
      if (status === 401) {
        setIsAuthError(true);
        setError('Please log in to view your saved wishlist.');
      } else {
        setError(
          err.response?.data?.message ||
          "We couldn't load your wishlist."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [onWishlistUpdate]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Handle local item removal without page reload
  const handleItemRemoved = (removedProductId) => {
    setWishlist((prevList) => {
      const updated = prevList.filter((item) => item._id !== removedProductId);
      if (onWishlistUpdate) {
        onWishlistUpdate(updated.length);
      }
      return updated;
    });
  };

  return (
    <div className="wishlist-page-container">
      {/* Top Header Bar */}
      <div className="wishlist-header">
        <div className="wishlist-title-group">
          <div className="wishlist-title-row">
            <Heart className="wishlist-header-heart" size={28} />
            <h1 className="wishlist-title">My Wishlist</h1>
          </div>
          {!isLoading && !error && (
            <p className="wishlist-count-text">
              {wishlist.length === 1
                ? '1 product saved'
                : `${wishlist.length} products saved`}
            </p>
          )}
        </div>

        <Link to="/products" className="btn-continue-shopping">
          <ArrowLeft size={16} />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Task 7: 1. Loading State */}
      {isLoading && (
        <div className="wishlist-state-container loading-state" role="status">
          <div className="spinner-large">
            <Loader2 size={36} className="spinner-icon" />
          </div>
          <p className="state-message">Loading your wishlist...</p>
          <div className="wishlist-skeleton-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-line title"></div>
                <div className="skeleton-line subtitle"></div>
                <div className="skeleton-line button"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task 7: 2. Error State */}
      {!isLoading && error && (
        <div className="wishlist-state-container error-state" role="alert">
          <div className="error-icon-box">
            <AlertCircle size={44} />
          </div>
          <h2 className="state-title">
            {isAuthError ? 'Authentication Required' : 'Something went wrong.'}
          </h2>
          <p className="state-subtitle">{error}</p>

          <div className="state-actions">
            {isAuthError ? (
              <Link to="/login" className="btn-primary-action">
                <span>Go to Login</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={loadWishlist}
                className="btn-retry"
                id="wishlist-retry-btn"
              >
                <RefreshCw size={16} />
                <span>Try Again</span>
              </button>
            )}
            <Link to="/products" className="btn-secondary-action">
              <span>Browse Products</span>
            </Link>
          </div>
        </div>
      )}

      {/* Task 7: 3. Empty Wishlist State */}
      {!isLoading && !error && wishlist.length === 0 && (
        <div className="wishlist-state-container empty-state">
          <div className="empty-heart-icon">❤️</div>
          <h2 className="state-title">Your wishlist is empty</h2>
          <p className="state-subtitle">
            Save products you love and find them here later.
          </p>
          <Link
            to="/products"
            className="btn-browse-products"
            id="browse-products-btn"
          >
            <ShoppingBag size={18} />
            <span>Browse Products</span>
          </Link>
        </div>
      )}

      {/* Wishlist Products Grid */}
      {!isLoading && !error && wishlist.length > 0 && (
        <div className="wishlist-grid" id="wishlist-grid">
          {wishlist.map((product) => (
            <WishlistCard
              key={product._id}
              product={product}
              onRemove={handleItemRemoved}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
