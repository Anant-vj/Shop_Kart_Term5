import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Truck,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Lock,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';

/**
 * Dynamically loads the Razorpay checkout script
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = ({ currentUser }) => {
  const navigate = useNavigate();
  const { cartItems, cartLoading, subtotal, totalQuantity, clearCartState } = useCart();

  // Form State
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Validation Errors
  const [errors, setErrors] = useState({});
  // In-flight payment & order processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Sync user details when currentUser loads
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.fullName || '',
        phone: prev.phone || currentUser.phone || '',
      }));
    }
  }, [currentUser]);

  // Delivery calculations
  const deliveryThreshold = 999;
  const isFreeDelivery = subtotal >= deliveryThreshold || subtotal === 0;
  const deliveryFee = isFreeDelivery ? 0 : 99;
  const grandTotal = subtotal + deliveryFee;

  // Validate form fields
  const validateForm = () => {
    const errs = {};
    const { fullName, phone, addressLine1, city, state, pincode } = formData;

    if (!fullName || !fullName.trim()) {
      errs.fullName = 'Full name is required';
    }

    if (!phone || !phone.trim()) {
      errs.phone = 'Phone number is required';
    } else {
      const cleanPhone = phone.trim().replace(/[\s-]/g, '');
      if (!/^\d{10,15}$/.test(cleanPhone)) {
        errs.phone = 'Please enter a valid 10-digit phone number';
      }
    }

    if (!addressLine1 || !addressLine1.trim()) {
      errs.addressLine1 = 'Address line is required';
    }

    if (!city || !city.trim()) {
      errs.city = 'City is required';
    }

    if (!state || !state.trim()) {
      errs.state = 'State is required';
    }

    if (!pincode || !pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(pincode.trim())) {
      errs.pincode = 'Pincode must contain exactly 6 digits';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-level error on change
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
    if (paymentError) {
      setPaymentError(null);
    }
  };

  /**
   * Main Checkout & Razorpay Flow
   */
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentUser) {
      setPaymentError('Please log in to complete your checkout.');
      return;
    }

    if (cartItems.length === 0) {
      setPaymentError('Your cart is empty. Add items before proceeding.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Step 1: Ensure Razorpay SDK is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay payment gateway SDK. Please check your internet connection.');
      }

      // Step 2: Create ShopKart Pending Order + Razorpay Order on Backend
      const orderPayload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      };

      const checkoutData = await createPaymentOrder(orderPayload);

      if (!checkoutData || !checkoutData.success) {
        throw new Error(checkoutData?.message || 'Failed to initialize payment order');
      }

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = checkoutData;

      // Step 3: Configure Razorpay Checkout Options
      const options = {
        key: key || 'rzp_test_51bShpkX7r4v4A',
        amount: amount,
        currency: currency || 'INR',
        name: 'ShopKart',
        description: `Order #${shopKartOrderId.slice(-6).toUpperCase()} Payment`,
        order_id: razorpayOrderId,
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
          email: currentUser.email || '',
        },
        theme: {
          color: '#6366f1',
        },
        handler: async function (response) {
          try {
            setIsProcessing(true);
            // Step 4: Verify HMAC SHA256 Signature on Backend
            const verificationPayload = {
              shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            const verificationResult = await verifyPayment(verificationPayload);

            if (verificationResult && verificationResult.success) {
              // Step 5: Order PAID and verified! Clear global frontend cart state
              clearCartState();
              // Navigate to Order Confirmation
              navigate(`/order-success/${shopKartOrderId}`);
            } else {
              throw new Error(verificationResult?.message || 'Payment signature verification failed');
            }
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr);
            setPaymentError(
              verifyErr.response?.data?.message ||
                verifyErr.message ||
                'Payment verification failed. Your cart was preserved.'
            );
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      // Check if Razorpay constructor is available
      if (typeof window.Razorpay !== 'function') {
        throw new Error('Razorpay SDK is not ready. Please refresh and try again.');
      }

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', function (failureResponse) {
        console.error('Razorpay payment failed:', failureResponse.error);
        setIsProcessing(false);
        setPaymentError(
          `Payment failed: ${failureResponse.error?.description || 'Transaction was declined.'} Your cart has not been cleared. Please try again.`
        );
      });

      paymentObject.open();
    } catch (err) {
      console.error('Checkout error:', err);
      const errorMsg =
        err.response?.data?.message || err.message || 'An unexpected error occurred during checkout.';
      setPaymentError(errorMsg);
      setIsProcessing(false);
    }
  };

  // 1. Loading State
  if (cartLoading) {
    return (
      <div className="checkout-page-container">
        <div className="cart-state-container loading-state" role="status">
          <Loader2 size={40} className="spinner-icon" />
          <h2 className="state-title">Preparing Checkout...</h2>
          <p className="state-subtitle">Loading your cart summary and verification details...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!currentUser) {
    return (
      <div className="checkout-page-container">
        <div className="cart-state-container error-state" role="alert">
          <AlertCircle size={48} className="error-icon" />
          <h2 className="state-title">Authentication Required</h2>
          <p className="state-subtitle">Please log in to your account to complete your checkout.</p>
          <div className="state-actions">
            <Link to="/login" className="btn-primary-action">
              <span>Go to Login</span>
            </Link>
            <Link to="/cart" className="btn-secondary-action">
              <span>Back to Cart</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty Cart State
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page-container">
        <div className="cart-state-container empty-state">
          <div className="empty-cart-icon">🛒</div>
          <h2 className="state-title">Your Cart is Empty</h2>
          <p className="state-subtitle">There are no items in your cart to checkout.</p>
          <div className="state-actions">
            <Link to="/products" className="btn-browse-products" id="checkout-browse-btn">
              <ShoppingBag size={18} />
              <span>Browse Products</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      {/* Header */}
      <div className="checkout-header-bar">
        <Link to="/cart" className="btn-back-to-cart">
          <ArrowLeft size={16} />
          <span>Back to Cart</span>
        </Link>
        <h1 className="checkout-page-title">Checkout</h1>
        <div className="checkout-secure-badge">
          <Lock size={15} />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      {paymentError && (
        <div className="checkout-error-banner" role="alert" id="checkout-error-banner">
          <AlertCircle size={20} />
          <div>
            <strong>Checkout Notice:</strong>
            <p>{paymentError}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Shipping Details Form + Order Summary */}
      <div className="checkout-layout-grid">
        {/* Left Column: Shipping Address Form */}
        <section className="checkout-form-section" aria-label="Shipping Address">
          <div className="checkout-card">
            <div className="checkout-card-header">
              <div className="step-badge">1</div>
              <div>
                <h2 className="checkout-section-heading">Shipping Address</h2>
                <p className="checkout-section-sub">Where should we deliver your order?</p>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} id="shipping-address-form" noValidate>
              <div className="form-group-row">
                <div className="form-field">
                  <label htmlFor="fullName" className="field-label">
                    Full Name <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className={`field-input ${errors.fullName ? 'input-error' : ''}`}
                    placeholder="e.g. Aarav Sharma"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                  />
                  {errors.fullName && <span className="field-error-msg">{errors.fullName}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="phone" className="field-label">
                    Phone Number <span className="required-star">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`field-input ${errors.phone ? 'input-error' : ''}`}
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                  />
                  {errors.phone && <span className="field-error-msg">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="addressLine1" className="field-label">
                  Address Line <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  className={`field-input ${errors.addressLine1 ? 'input-error' : ''}`}
                  placeholder="Street address, apartment, flat, suite"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  disabled={isProcessing}
                />
                {errors.addressLine1 && (
                  <span className="field-error-msg">{errors.addressLine1}</span>
                )}
              </div>

              <div className="form-group-row-three">
                <div className="form-field">
                  <label htmlFor="city" className="field-label">
                    City <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className={`field-input ${errors.city ? 'input-error' : ''}`}
                    placeholder="e.g. Bengaluru"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                  />
                  {errors.city && <span className="field-error-msg">{errors.city}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="state" className="field-label">
                    State <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    className={`field-input ${errors.state ? 'input-error' : ''}`}
                    placeholder="e.g. Karnataka"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                  />
                  {errors.state && <span className="field-error-msg">{errors.state}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="pincode" className="field-label">
                    Pincode <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    maxLength={6}
                    className={`field-input ${errors.pincode ? 'input-error' : ''}`}
                    placeholder="6-digit pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                  />
                  {errors.pincode && <span className="field-error-msg">{errors.pincode}</span>}
                </div>
              </div>

              <div className="checkout-payment-method-box">
                <div className="step-badge">2</div>
                <div>
                  <h3 className="payment-method-title">Payment Method</h3>
                  <p className="payment-method-sub">
                    Secure Razorpay Test Mode Checkout (Supports UPI, Cards, NetBanking, Wallets)
                  </p>
                </div>
              </div>
            </form>
          </div>
        </section>

        {/* Right Column: Order Summary */}
        <aside className="checkout-summary-section" aria-label="Order Summary">
          <div className="order-summary-card">
            <h2 className="order-summary-title">Order Review</h2>

            {/* Cart Items Snapshot List */}
            <div className="checkout-items-list" id="checkout-items-list">
              {cartItems.map((item) => {
                const product = item.product || {};
                const lineTotal = (Number(product.price) || 0) * (Number(item.quantity) || 1);
                return (
                  <div key={product._id || item._id} className="checkout-item-row">
                    <img
                      src={
                        product.image ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80'
                      }
                      alt={product.name}
                      className="checkout-item-thumb"
                    />
                    <div className="checkout-item-info">
                      <h4 className="checkout-item-name">{product.name}</h4>
                      <div className="checkout-item-qty">
                        Qty: <strong>{item.quantity}</strong> × ₹
                        {Number(product.price).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="checkout-item-line-total">
                      ₹{lineTotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="summary-divider"></div>

            {/* Price Calculations */}
            <div className="summary-breakdown">
              <div className="summary-row">
                <span className="summary-label">Items ({totalQuantity}):</span>
                <span className="summary-value">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Delivery:</span>
                <span className="summary-value">
                  {isFreeDelivery ? (
                    <span className="text-free">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row grand-total-row">
                <span className="total-label">Total to Pay</span>
                <span className="total-value" id="checkout-total-amount">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <p className="summary-tax-note">Includes all GST & taxes</p>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="btn-place-order"
              id="btn-place-order"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="spinner-icon" />
                  <span>Connecting Razorpay...</span>
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  <span>Place Order & Pay ₹{grandTotal.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>

            {/* Trust Badges */}
            <div className="checkout-trust-box">
              <div className="trust-item">
                <ShieldCheck size={16} />
                <span>100% Test Mode — No real money deducted</span>
              </div>
              <div className="trust-item">
                <Truck size={16} />
                <span>Real-time backend stock verification</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
