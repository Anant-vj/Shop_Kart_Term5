import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { registerCustomer } from '../services/api';

const Register = () => {
  const navigate = useNavigate();

  // Controlled component form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error upon typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) setError('');
  };

  // Client-side validation
  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please provide a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9+ -]{7,15}$/.test(formData.phone.trim())) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await registerCustomer(formData);
      if (response.success) {
        setSuccessMessage('Account created successfully! Redirecting to login...');
        // Wait 1.2s to show success feedback, then redirect to /login
        setTimeout(() => {
          navigate('/login', { state: { registeredEmail: formData.email } });
        }, 1200);
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message || 'Failed to create account. Please try again.';
      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <h1>Create an Account</h1>
          <p>Join ShopKart today to start shopping smart</p>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Global Success Alert */}
        {successMessage && (
          <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              Full Name
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <User size={18} />
              </span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className={`form-input ${fieldErrors.fullName ? 'has-error' : ''}`}
                placeholder="e.g. John Doe"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
                autoComplete="name"
                required
              />
            </div>
            {fieldErrors.fullName && <span className="field-error">{fieldErrors.fullName}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Mail size={18} />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                className={`form-input ${fieldErrors.email ? 'has-error' : ''}`}
                placeholder="john@gmail.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${fieldErrors.password ? 'has-error' : ''}`}
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              Phone Number
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Phone size={18} />
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={`form-input ${fieldErrors.phone ? 'has-error' : ''}`}
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                autoComplete="tel"
                required
              />
            </div>
            {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderTopColor: 'white' }}></span>
                <span>Creating Account...</span>
              </span>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
