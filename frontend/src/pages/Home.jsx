import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck } from 'lucide-react';
import { getProfile } from '../services/api';

const Home = ({ onUserLoaded }) => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchCustomerProfile = async () => {
      try {
        setLoading(true);
        // Call GET /customers/me with withCredentials: true (HttpOnly cookie attached automatically)
        const data = await getProfile();

        if (isMounted) {
          setCustomer(data);
          if (onUserLoaded) {
            onUserLoaded(data);
          }
        }
      } catch (err) {
        // Requirement: If Not Logged In -> Automatically redirect to /login
        if (isMounted) {
          setError('Session expired or unauthorized. Redirecting to login...');
          setTimeout(() => {
            navigate('/login');
          }, 400);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCustomerProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Loading State
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
          Authenticating ShopKart customer session...
        </p>
      </div>
    );
  }

  // If unauthorized, show redirect message
  if (error || !customer) {
    return (
      <div className="loading-state">
        <p style={{ color: 'var(--danger)', fontWeight: 600 }}>{error || 'Redirecting...'}</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Welcome Hero Banner */}
      <section className="welcome-hero">
        <div>
          <h1>Welcome back, {customer.fullName}!</h1>
          <p>
            You are securely authenticated. Explore the ShopKart portal, view your verified profile, and access exclusive member deals.
          </p>
        </div>
      </section>

      {/* Verified Profile Card */}
      <section className="profile-card">
        <div className="profile-card-header">
          <div className="profile-title">
            <User size={22} color="var(--primary)" />
            <h2>Customer Account Details</h2>
          </div>
          <span className="status-badge">
            <ShieldCheck size={14} />
            <span>Authenticated Session</span>
          </span>
        </div>

        <div className="profile-grid">
          {/* Customer Name */}
          <div className="profile-field">
            <span className="field-label">Customer Name</span>
            <span className="field-value">{customer.fullName}</span>
          </div>

          {/* Email Address */}
          <div className="profile-field">
            <span className="field-label">Email Address</span>
            <span className="field-value">{customer.email}</span>
          </div>

          {/* Phone Number */}
          <div className="profile-field">
            <span className="field-label">Phone Number</span>
            <span className="field-value">{customer.phone}</span>
          </div>

          {/* Customer ID */}
          <div className="profile-field">
            <span className="field-label">Customer ID</span>
            <span className="field-value" style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
              {customer._id}
            </span>
          </div>
        </div>
      </section>

      {/* Storefront / Member Perks Section */}
      <section className="storefront-section">
        <h3>Explore ShopKart Categories</h3>
        <div className="category-grid">
          <div className="category-card">
            <div className="category-icon">💻</div>
            <div className="category-name">Electronics</div>
            <div className="category-desc">Laptops, audio & mobile accessories with 1-year warranty</div>
          </div>

          <div className="category-card">
            <div className="category-icon">👕</div>
            <div className="category-name">Fashion & Apparel</div>
            <div className="category-desc">Trendy apparel, footwear and accessories curated for you</div>
          </div>

          <div className="category-card">
            <div className="category-icon">🏡</div>
            <div className="category-name">Home & Living</div>
            <div className="category-desc">Modern furniture, smart decor, and kitchen essentials</div>
          </div>

          <div className="category-card">
            <div className="category-icon">⚡</div>
            <div className="category-name">Special Offers</div>
            <div className="category-desc">Flash sales and member discounts up to 40% off</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
