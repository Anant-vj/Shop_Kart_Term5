import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Tag,
  Package,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Heart,
  Loader2,
} from 'lucide-react';
import { fetchProductById, getWishlist, toggleWishlist } from '../services/api';

const ProductDetails = ({ onWishlistCountChange }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedNotice, setAddedNotice] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistNotice, setWishlistNotice] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadProductDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await fetchProductById(id);

        if (isMounted) {
          if (data.success && data.product) {
            setProduct(data.product);

            // Check if product is in current user's wishlist
            try {
              const wishData = await getWishlist();
              if (wishData && Array.isArray(wishData.wishlist)) {
                const found = wishData.wishlist.some(
                  (item) => (item._id || item).toString() === id.toString()
                );
                setIsWishlisted(found);
              }
            } catch (wErr) {
              // Silently ignore if unauthenticated
            }
          } else {
            setError('Product details could not be loaded.');
          }
        }
      } catch (err) {
        if (isMounted) {
          const status = err.response?.status;
          if (status === 404) {
            setError('The product you are looking for does not exist or has been removed.');
          } else if (status === 400) {
            setError('Invalid product identification format.');
          } else {
            setError('Failed to retrieve product details from backend.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProductDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = () => {
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleWishlistToggle = async () => {
    if (wishlistLoading) return;
    setWishlistLoading(true);
    setWishlistNotice(null);

    try {
      const data = await toggleWishlist(id);
      setIsWishlisted(data.saved);
      setWishlistNotice({
        type: 'success',
        text: data.saved ? '♥ Added to your wishlist!' : 'Removed from your wishlist.',
      });
      setTimeout(() => setWishlistNotice(null), 3000);
      if (onWishlistCountChange) {
        onWishlistCountChange(data.count);
      }
    } catch (err) {
      const status = err.response?.status;
      let msg = 'Unable to update wishlist. Please try again.';
      if (status === 401) {
        msg = 'Please log in to save items to your wishlist.';
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setWishlistNotice({ type: 'error', text: msg });
      setTimeout(() => setWishlistNotice(null), 4000);
    } finally {
      setWishlistLoading(false);
    }
  };

  // State 1: Loading
  if (loading) {
    return (
      <div className="product-details-page">
        <div className="state-container loading-state-box">
          <div className="spinner"></div>
          <p className="state-message">Loading product details...</p>
        </div>
      </div>
    );
  }

  // State 2: Error
  if (error || !product) {
    return (
      <div className="product-details-page">
        <div className="state-container error-state-box">
          <AlertCircle size={48} className="state-icon text-danger" />
          <h2 className="state-title">Product Not Found</h2>
          <p className="state-message">{error || 'Could not find this product.'}</p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <Link to="/products" className="btn-secondary">
              <ArrowLeft size={16} />
              <span>Back to Products</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="product-details-page">
      {/* Back Button / Breadcrumb */}
      <nav className="details-breadcrumb">
        <Link to="/products" className="btn-back">
          <ArrowLeft size={18} />
          <span>Back to Products</span>
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-category">{product.category}</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </nav>

      {/* Main Details Grid */}
      <div className="product-details-card">
        {/* Large Product Image */}
        <div className="details-image-section">
          <img
            src={product.image}
            alt={product.name}
            className="details-large-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {/* Product Details & Actions */}
        <div className="details-content-section">
          {/* Category Badge */}
          <div className="details-badge-row">
            <span className="product-category-pill">
              <Tag size={13} />
              <span>{product.category}</span>
            </span>

            <span
              className={`stock-badge ${
                isOutOfStock ? 'stock-out' : isLowStock ? 'stock-low' : 'stock-in'
              }`}
            >
              <Package size={13} />
              <span>
                {isOutOfStock
                  ? 'Out of Stock'
                  : `${product.stock} units available`}
              </span>
            </span>
          </div>

          {/* Product Title */}
          <h1 className="details-title">{product.name}</h1>

          {/* Price */}
          <div className="details-price-tag">
            <span className="currency-symbol">₹</span>
            <span className="amount">
              {product.price ? product.price.toLocaleString('en-IN') : '0'}
            </span>
            <span className="tax-included">Inclusive of all taxes</span>
          </div>

          {/* Description */}
          <div className="details-description-box">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {/* Notifications */}
          {addedNotice && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              <CheckCircle2 size={18} />
              <span>Added to cart preview! (Cart backend API comes in Lab 05)</span>
            </div>
          )}

          {wishlistNotice && (
            <div
              className={`alert ${
                wishlistNotice.type === 'error' ? 'alert-danger' : 'alert-success'
              }`}
              style={{ marginBottom: '1rem' }}
            >
              {wishlistNotice.type === 'error' ? (
                <AlertCircle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              <span>{wishlistNotice.text}</span>
            </div>
          )}

          {/* Actions: Add to Cart and Wishlist Toggle */}
          <div className="details-actions">
            <button
              type="button"
              className="btn-add-to-cart"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart size={20} />
              <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>

            <button
              type="button"
              className={`btn-details-wishlist ${isWishlisted ? 'saved' : ''} ${
                wishlistLoading ? 'loading' : ''
              }`}
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              id={`details-wishlist-btn-${product._id}`}
            >
              {wishlistLoading ? (
                <>
                  <Loader2 size={18} className="spinner-icon" />
                  <span>⏳ Saving...</span>
                </>
              ) : isWishlisted ? (
                <>
                  <Heart size={18} fill="#f43f5e" color="#f43f5e" />
                  <span>♥ Saved to Wishlist</span>
                </>
              ) : (
                <>
                  <Heart size={18} />
                  <span>♡ Add to Wishlist</span>
                </>
              )}
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="product-perks-grid">
            <div className="perk-item">
              <Truck size={18} className="perk-icon" />
              <div>
                <strong>Free Delivery</strong>
                <p>On orders above ₹999</p>
              </div>
            </div>

            <div className="perk-item">
              <RotateCcw size={18} className="perk-icon" />
              <div>
                <strong>7 Days Return</strong>
                <p>Hassle-free exchange policy</p>
              </div>
            </div>

            <div className="perk-item">
              <ShieldCheck size={18} className="perk-icon" />
              <div>
                <strong>100% Genuine</strong>
                <p>Authentic verified ShopKart products</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
