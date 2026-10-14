import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowRight,
  MapPin,
  Calendar,
  CreditCard,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { fetchOrderById } from '../services/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const getOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchOrderById(id);
        if (isMounted) {
          if (data && data.order) {
            setOrder(data.order);
          } else {
            setError('Order details could not be retrieved.');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching order confirmation:', err);
          setError(
            err.response?.data?.message ||
              'Unable to load order details. Don’t worry, your payment was recorded.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      getOrder();
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="order-success-container">
        <div className="cart-state-container loading-state" role="status">
          <Loader2 size={44} className="spinner-icon" />
          <h2 className="state-title">Loading Confirmation...</h2>
          <p className="state-subtitle">Fetching your confirmed order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-success-container">
        <div className="cart-state-container error-state" role="alert">
          <AlertCircle size={48} className="error-icon" />
          <h2 className="state-title">Order Lookup Notice</h2>
          <p className="state-subtitle">{error || 'Order not found.'}</p>
          <div className="state-actions">
            <Link to="/orders" className="btn-primary-action">
              <span>View My Orders</span>
            </Link>
            <Link to="/products" className="btn-secondary-action">
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="order-success-container">
      {/* Success Hero Header */}
      <div className="order-success-hero">
        <div className="success-icon-bubble">
          <CheckCircle2 size={52} className="success-check-icon" />
        </div>
        <h1 className="success-hero-title">Order Placed Successfully!</h1>
        <p className="success-hero-subtitle">
          Thank you for your purchase. Your payment was verified and your order is confirmed.
        </p>

        <div className="order-quick-meta">
          <div className="meta-chip">
            <span className="chip-label">Order ID:</span>
            <span className="chip-value" id="order-id-display">
              {order._id}
            </span>
          </div>
          <div className="meta-chip">
            <span className="chip-label">Status:</span>
            <span className="chip-value status-chip-placed" id="order-status-display">
              {order.status || 'PLACED'}
            </span>
          </div>
          <div className="meta-chip">
            <span className="chip-label">Payment:</span>
            <span className="chip-value status-chip-paid">
              {order.paymentStatus || 'PAID'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Order Details Card */}
      <div className="order-success-card">
        {/* Purchased Items List */}
        <div className="order-details-section">
          <div className="section-title-row">
            <Package size={20} />
            <h2 className="section-title">Purchased Items ({order.items?.length || 0})</h2>
          </div>

          <div className="order-items-grid" id="order-items-summary">
            {order.items?.map((item, idx) => (
              <div key={item._id || idx} className="order-item-card">
                <img
                  src={
                    item.image ||
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80'
                  }
                  alt={item.name}
                  className="order-item-thumb"
                />
                <div className="order-item-details">
                  <h3 className="order-item-name">{item.name}</h3>
                  <div className="order-item-pricing">
                    <span>
                      Qty: <strong>{item.quantity}</strong> × ₹
                      {Number(item.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className="order-item-total">
                  ₹{(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Meta Grid */}
        <div className="order-info-meta-grid">
          {/* Shipping Address Snapshot */}
          <div className="order-info-col">
            <div className="section-title-row">
              <MapPin size={18} />
              <h3 className="sub-title">Shipping Address</h3>
            </div>
            {order.shippingAddress ? (
              <div className="address-snapshot-box">
                <p className="address-name">{order.shippingAddress.fullName}</p>
                <p className="address-line">{order.shippingAddress.addressLine1}</p>
                <p className="address-city">
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  {order.shippingAddress.pincode}
                </p>
                <p className="address-phone">Phone: {order.shippingAddress.phone}</p>
              </div>
            ) : (
              <p className="address-line">Standard Delivery Address</p>
            )}
          </div>

          {/* Payment & Date Details */}
          <div className="order-info-col">
            <div className="section-title-row">
              <CreditCard size={18} />
              <h3 className="sub-title">Payment Summary</h3>
            </div>
            <div className="payment-snapshot-box">
              <div className="info-row">
                <span>Date Placed:</span>
                <strong>{formattedDate}</strong>
              </div>
              <div className="info-row">
                <span>Payment Method:</span>
                <strong>Razorpay Test Mode</strong>
              </div>
              {order.razorpayPaymentId && (
                <div className="info-row">
                  <span>Payment ID:</span>
                  <code className="payment-id-code">{order.razorpayPaymentId}</code>
                </div>
              )}
              <div className="info-divider"></div>
              <div className="info-row total-paid-row">
                <span>Total Paid:</span>
                <span className="total-paid-value" id="order-total-display">
                  ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="order-success-actions">
          <Link to="/orders" className="btn-view-orders" id="btn-view-orders">
            <Package size={18} />
            <span>View My Orders</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/products" className="btn-continue-shopping-alt" id="btn-continue-shopping">
            <ShoppingBag size={18} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
