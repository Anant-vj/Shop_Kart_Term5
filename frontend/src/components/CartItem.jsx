import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart, actionLoadingMap } = useCart();
  const [localError, setLocalError] = useState(null);

  if (!item || !item.product) return null;

  const { product, quantity } = item;
  const isLoading = Boolean(actionLoadingMap[product._id]);
  const isMaxStock = quantity >= product.stock;
  const isMinQuantity = quantity <= 1;

  const handleIncrement = async () => {
    if (isLoading || isMaxStock) return;
    setLocalError(null);
    try {
      await updateQuantity(product._id, quantity + 1);
    } catch (err) {
      setLocalError(err.message);
      setTimeout(() => setLocalError(null), 3500);
    }
  };

  const handleDecrement = async () => {
    if (isLoading || isMinQuantity) return;
    setLocalError(null);
    try {
      await updateQuantity(product._id, quantity - 1);
    } catch (err) {
      setLocalError(err.message);
      setTimeout(() => setLocalError(null), 3500);
    }
  };

  const handleRemove = async () => {
    if (isLoading) return;
    setLocalError(null);
    try {
      await removeFromCart(product._id);
    } catch (err) {
      setLocalError(err.message);
      setTimeout(() => setLocalError(null), 3500);
    }
  };

  const itemTotal = (Number(product.price) || 0) * quantity;

  return (
    <article className="cart-item-card" id={`cart-item-${product._id}`}>
      {/* Product Image */}
      <div className="cart-item-image-box">
        <img
          src={product.image}
          alt={product.name}
          className="cart-item-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
          }}
        />
      </div>

      {/* Product Information */}
      <div className="cart-item-details">
        <div className="cart-item-header">
          <Link to={`/products/${product._id}`} className="cart-item-title">
            {product.name}
          </Link>
          <div className="cart-item-category">{product.category}</div>
        </div>

        <div className="cart-item-unit-price">
          Unit Price: <strong>₹{product.price ? product.price.toLocaleString('en-IN') : '0'}</strong>
          <span className="cart-stock-notice">
            ({product.stock} available)
          </span>
        </div>

        {/* Local Error feedback if quantity update fails */}
        {localError && (
          <div className="cart-item-error" role="alert">
            <AlertCircle size={14} />
            <span>{localError}</span>
          </div>
        )}

        {/* Quantity Controls & Remove Action */}
        <div className="cart-item-controls-row">
          <div className="quantity-control-group">
            <button
              type="button"
              className="qty-btn qty-btn-minus"
              onClick={handleDecrement}
              disabled={isLoading || isMinQuantity}
              aria-label="Decrease quantity"
              title={isMinQuantity ? 'Quantity cannot be less than 1 (Use Remove)' : 'Decrease quantity'}
              id={`qty-minus-${product._id}`}
            >
              <Minus size={14} />
            </button>

            <span className="qty-value" id={`qty-value-${product._id}`}>
              {isLoading ? <Loader2 size={14} className="spinner-icon" /> : quantity}
            </span>

            <button
              type="button"
              className="qty-btn qty-btn-plus"
              onClick={handleIncrement}
              disabled={isLoading || isMaxStock}
              aria-label="Increase quantity"
              title={isMaxStock ? `Max available stock reached (${product.stock})` : 'Increase quantity'}
              id={`qty-plus-${product._id}`}
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            type="button"
            className="btn-cart-remove"
            onClick={handleRemove}
            disabled={isLoading}
            aria-label="Remove product from cart"
            id={`cart-remove-${product._id}`}
          >
            {isLoading ? (
              <Loader2 size={14} className="spinner-icon" />
            ) : (
              <Trash2 size={14} />
            )}
            <span>Remove</span>
          </button>
        </div>
      </div>

      {/* Line Item Total (price * quantity) */}
      <div className="cart-item-price-column">
        <span className="line-total-label">Subtotal</span>
        <span className="line-total-amount">
          ₹{itemTotal.toLocaleString('en-IN')}
        </span>
        {quantity > 1 && (
          <span className="line-total-calc">
            ₹{product.price?.toLocaleString('en-IN')} × {quantity}
          </span>
        )}
      </div>
    </article>
  );
};

export default CartItem;
