import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Package, Trash2, ArrowRight, Loader2, Heart } from 'lucide-react';
import { removeFromWishlist } from '../services/api';

const WishlistCard = ({ product, onRemove }) => {
  if (!product) return null;

  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleRemove = async (e) => {
    e.preventDefault();
    if (isRemoving) return;

    setIsRemoving(true);
    setErrorMessage(null);

    try {
      await removeFromWishlist(product._id);
      if (onRemove) {
        onRemove(product._id);
      }
    } catch (err) {
      console.error('Failed to remove product from wishlist:', err);
      const msg =
        err.response?.data?.message ||
        'Unable to remove product from wishlist. Please try again.';
      setErrorMessage(msg);
      setIsRemoving(false);
    }
  };

  return (
    <article className="product-card wishlist-card" id={`wishlist-item-${product._id}`}>
      {/* Product Image */}
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Category Pill */}
        <span className="product-category-pill">
          <Tag size={12} />
          <span>{product.category}</span>
        </span>
      </div>

      {/* Product Information */}
      <div className="product-info">
        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>

        {/* Category line */}
        <div className="product-category-text">{product.category}</div>

        {/* Price & Stock */}
        <div className="product-pricing-row">
          <div className="product-price">
            ₹{product.price ? product.price.toLocaleString('en-IN') : '0'}
          </div>

          <div
            className={`stock-badge ${
              isOutOfStock ? 'stock-out' : isLowStock ? 'stock-low' : 'stock-in'
            }`}
          >
            <Package size={12} />
            <span>
              {isOutOfStock ? 'Out of Stock' : `${product.stock} units left`}
            </span>
          </div>
        </div>

        {/* Removal Error Alert */}
        {errorMessage && (
          <div className="card-alert card-alert-error" role="alert">
            {errorMessage}
          </div>
        )}

        {/* Wishlist Card Actions: [ View Details ] & [ Remove ♥ ] */}
        <div className="wishlist-card-actions">
          <Link
            to={`/products/${product._id}`}
            className="btn-view-details"
            id={`wishlist-view-${product._id}`}
          >
            <span>View Details</span>
            <ArrowRight size={15} />
          </Link>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className={`btn-remove-wishlist ${isRemoving ? 'loading' : ''}`}
            id={`wishlist-remove-${product._id}`}
            title="Remove from wishlist"
          >
            {isRemoving ? (
              <>
                <Loader2 size={15} className="spinner-icon" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>Remove ♥</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default WishlistCard;
