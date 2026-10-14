import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Package, ArrowRight, Heart, Loader2, ShoppingCart } from 'lucide-react';
import { toggleWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, isWishlisted = false, onWishlistToggle }) => {
  if (!product) return null;

  const { addToCart, getItemQuantity } = useCart();
  const [saved, setSaved] = useState(isWishlisted);
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    setSaved(isWishlisted);
  }, [isWishlisted]);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const cartQty = getItemQuantity(product._id);
  const isInCart = cartQty > 0;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent duplicate clicks while request is running
    if (loading) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const response = await toggleWishlist(product._id);
      const isNowSaved = response.saved !== undefined ? response.saved : true;
      setSaved(isNowSaved);

      if (isNowSaved) {
        setSuccessMsg('♥ Added to Wishlist');
      } else {
        setSuccessMsg('Removed from Wishlist');
      }

      setTimeout(() => setSuccessMsg(null), 3000);

      if (onWishlistToggle) {
        onWishlistToggle(product._id, isNowSaved, response.count);
      }
    } catch (err) {
      const status = err.response ? err.response.status : null;
      let msg = 'Unable to save product. Please try again.';

      if (status === 401) {
        msg = 'Please log in to save products to your wishlist.';
      } else if (status === 409) {
        msg = 'Already in your wishlist.';
        setSaved(true);
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }

      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Task 7: Add to Cart Handler
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (addingToCart || isOutOfStock) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setAddingToCart(true);

    try {
      await addToCart(product._id);
      setSuccessMsg('🛒 Added to Cart');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to add to cart.');
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <article className="product-card" id={`product-${product._id}`}>
      {/* Product Image & Top Overlays */}
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

        {/* Floating Heart Icon Button on Image */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={loading}
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`btn-wishlist-float ${saved ? 'saved' : ''} ${loading ? 'loading' : ''}`}
          id={`wishlist-float-${product._id}`}
          title={saved ? 'In your wishlist (Click to remove)' : 'Add to wishlist'}
        >
          {loading ? (
            <Loader2 size={16} className="spinner-icon" />
          ) : (
            <Heart size={16} fill={saved ? '#f43f5e' : 'none'} color={saved ? '#f43f5e' : '#ffffff'} />
          )}
        </button>
      </div>

      {/* Product Body */}
      <div className="product-info">
        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>

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

        {/* Action Feedback Alerts */}
        {errorMsg && (
          <div className="card-alert card-alert-error" role="alert">
            {errorMsg}
          </div>
        )}
        {successMsg && !errorMsg && (
          <div className="card-alert card-alert-success" role="status">
            {successMsg}
          </div>
        )}

        {/* Primary Action: Task 7 - Add to Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={addingToCart || isOutOfStock}
          className={`btn-card-add-to-cart ${isInCart ? 'in-cart' : ''} ${addingToCart ? 'loading' : ''}`}
          id={`add-to-cart-${product._id}`}
        >
          {addingToCart ? (
            <>
              <Loader2 size={15} className="spinner-icon" />
              <span>Adding...</span>
            </>
          ) : isOutOfStock ? (
            <span>Out of Stock</span>
          ) : isInCart ? (
            <>
              <ShoppingCart size={15} />
              <span>Add Another ({cartQty})</span>
            </>
          ) : (
            <>
              <ShoppingCart size={15} />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        {/* Secondary Actions: [ View Details ] & [ ♡ Wishlist ] */}
        <div className="product-card-actions">
          <Link
            to={`/products/${product._id}`}
            className="btn-view-details"
            id={`view-details-${product._id}`}
          >
            <span>View Details</span>
            <ArrowRight size={14} />
          </Link>

          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={loading}
            className={`btn-card-wishlist ${saved ? 'saved' : ''} ${loading ? 'loading' : ''}`}
            id={`wishlist-btn-${product._id}`}
          >
            {loading ? (
              <>
                <Loader2 size={13} className="spinner-icon" />
                <span>Saving...</span>
              </>
            ) : saved ? (
              <>
                <Heart size={13} fill="#f43f5e" color="#f43f5e" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Heart size={13} />
                <span>Wishlist</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
