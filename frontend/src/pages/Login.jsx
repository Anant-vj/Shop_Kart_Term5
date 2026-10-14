import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { loginCustomer } from '../services/api';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // If user just registered, prepopulate email
  const initialEmail = location.state?.registeredEmail || '';

  // Controlled form state
  const [formData, setFormData] = useState({
    email: initialEmail,
    password: '',
  });

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await loginCustomer(formData);

      if (response.success) {
        // Notify parent App component of login state
        if (onLoginSuccess) {
          onLoginSuccess(response.customer || null);
        }
        // Requirement: On success → Navigate to /home
        navigate('/home');
      }
    } catch (err) {
      // Requirement: Show "Invalid Credentials" on failure
      if (err.response?.status === 401) {
        setError('Invalid Credentials. Please check your email and password.');
      } else {
        setError(err.response?.data?.message || 'Invalid Credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Please enter your credentials to access your account</p>
        </div>

        {/* Failure Message */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
                className="form-input"
                placeholder="john@gmail.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>
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
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="current-password"
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
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderTopColor: 'white' }}></span>
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="auth-footer">
          Don't have an account yet? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
