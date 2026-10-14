import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  ShoppingBag,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { fetchUserOrders, updateOrderStatus } from '../services/api';

const STATUS_PROGRESSION = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const Orders = ({ currentUser }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [advancingId, setAdvancingId] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserOrders();
      if (data && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load your orders. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [currentUser, loadOrders]);

  // Bonus Feature: Advance status to next step in workflow
  const handleAdvanceStatus = async (orderId, currentStatus) => {
    const currentIndex = STATUS_PROGRESSION.indexOf(currentStatus);
    const nextStatus =
      currentIndex !== -1 && currentIndex < STATUS_PROGRESSION.length - 1
        ? STATUS_PROGRESSION[currentIndex + 1]
        : STATUS_PROGRESSION[0];

    try {
      setAdvancingId(orderId);
      const result = await updateOrderStatus(orderId, nextStatus);
      if (result && result.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o))
        );
      }
    } catch (err) {
      console.error('Failed to advance order status:', err);
      alert(err.response?.data?.message || 'Could not update order status.');
    } finally {
      setAdvancingId(null);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="orders-page-container">
        <div className="cart-state-container loading-state" role="status">
          <Loader2 size={44} className="spinner-icon" />
          <h2 className="state-title">Loading your orders...</h2>
          <p className="state-subtitle">Retrieving your past purchases from ShopKart...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!currentUser) {
    return (
      <div className="orders-page-container">
        <div className="cart-state-container error-state" role="alert">
          <AlertCircle size={48} className="error-icon" />
          <h2 className="state-title">Authentication Required</h2>
          <p className="state-subtitle">Please log in to view your orders history.</p>
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
  if (error) {
    return (
      <div className="orders-page-container">
        <div className="cart-state-container error-state" role="alert">
          <AlertCircle size={48} className="error-icon" />
          <h2 className="state-title">Unable to load orders</h2>
          <p className="state-subtitle">{error}</p>
          <div className="state-actions">
            <button
              type="button"
              onClick={loadOrders}
              className="btn-retry"
              id="orders-retry-btn"
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

  // 4. Empty State (Task 8)
  if (orders.length === 0) {
    return (
      <div className="orders-page-container">
        <div className="cart-state-container empty-state">
          <div className="empty-cart-icon">📦</div>
          <h2 className="state-title">You have not placed any orders yet.</h2>
          <p className="state-subtitle">
            Once you complete a purchase, your order history and live shipping updates will appear here.
          </p>
          <div className="state-actions">
            <Link to="/products" className="btn-browse-products" id="orders-start-shopping-btn">
              <ShoppingBag size={18} />
              <span>Start Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page-container">
      {/* Page Header */}
      <div className="orders-header-bar">
        <div>
          <h1 className="orders-page-title">My Orders</h1>
          <p className="orders-page-subtitle">
            Showing {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed with ShopKart
          </p>
        </div>
        <Link to="/products" className="btn-continue-shopping">
          <ShoppingBag size={16} />
          <span>Shop More</span>
        </Link>
      </div>

      {/* Orders List */}
      <div className="orders-list-grid" id="orders-list-grid">
        {orders.map((order) => {
          const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          const currentStatus = order.status || 'PLACED';
          const nextIndex = STATUS_PROGRESSION.indexOf(currentStatus);
          const nextTargetStatus =
            nextIndex !== -1 && nextIndex < STATUS_PROGRESSION.length - 1
              ? STATUS_PROGRESSION[nextIndex + 1]
              : 'PLACED';

          return (
            <div key={order._id} className="order-history-card">
              {/* Card Top Banner */}
              <div className="order-card-header">
                <div className="order-header-left">
                  <div className="order-id-label">
                    Order <strong>#{order._id}</strong>
                  </div>
                  <div className="order-date-text">
                    <Calendar size={14} />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                <div className="order-header-badges">
                  <span
                    className={`order-status-badge badge-${currentStatus.toLowerCase()}`}
                  >
                    {currentStatus}
                  </span>
                  <span
                    className={`order-payment-badge badge-${(order.paymentStatus || 'PENDING').toLowerCase()}`}
                  >
                    {order.paymentStatus || 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Status Visual Tracker */}
              <div className="order-status-tracker">
                {STATUS_PROGRESSION.map((stepName, idx) => {
                  const stepIndex = STATUS_PROGRESSION.indexOf(stepName);
                  const activeIndex = STATUS_PROGRESSION.indexOf(currentStatus);
                  const isDone = activeIndex >= stepIndex;
                  const isCurrent = activeIndex === stepIndex;

                  return (
                    <div
                      key={stepName}
                      className={`tracker-step ${isDone ? 'step-done' : ''} ${isCurrent ? 'step-current' : ''}`}
                    >
                      <div className="tracker-bullet">
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span className="tracker-label">{stepName}</span>
                    </div>
                  );
                })}
              </div>

              {/* Items List */}
              <div className="order-card-items">
                {order.items?.map((item, idx) => (
                  <div key={item._id || idx} className="order-card-item-row">
                    <img
                      src={
                        item.image ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80'
                      }
                      alt={item.name}
                      className="order-card-item-thumb"
                    />
                    <div className="order-card-item-details">
                      <h4 className="item-name">{item.name}</h4>
                      <p className="item-meta">
                        Qty: <strong>{item.quantity}</strong> × ₹
                        {Number(item.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="item-line-total">
                      ₹{(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer: Address + Total + Actions */}
              <div className="order-card-footer">
                <div className="order-footer-address">
                  <MapPin size={15} />
                  <span>
                    Delivering to: <strong>{order.shippingAddress?.fullName}</strong>,{' '}
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                    {order.shippingAddress?.pincode}
                  </span>
                </div>

                <div className="order-footer-right">
                  <div className="order-card-total-box">
                    <span className="total-label">Total:</span>
                    <span className="total-amount">
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Bonus Action: Advance Status */}
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus(order._id, currentStatus)}
                    disabled={advancingId === order._id}
                    className="btn-advance-status"
                    title={`Advance status to ${nextTargetStatus} (Bonus Lab 06 demo)`}
                  >
                    {advancingId === order._id ? (
                      <Loader2 size={14} className="spinner-icon" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    <span>Advance to {nextTargetStatus}</span>
                  </button>

                  <Link
                    to={`/order-success/${order._id}`}
                    className="btn-view-order-details"
                  >
                    <span>View Receipt</span>
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
