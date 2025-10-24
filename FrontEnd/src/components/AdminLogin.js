import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import '../styles/Admin.css';

const AdminLogin = ({ setCurrentUser }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [superAdminMode, setSuperAdminMode] = useState(false);
  const [keySequence, setKeySequence] = useState([]);

  useEffect(() => {
   
    const handleKeyDown = (event) => {
      if (!superAdminMode) {
        const newSequence = [...keySequence, event.key.toLowerCase()];
        setKeySequence(newSequence);
        
     
        const secretCode = ['s', 'u', 'p', 'e', 'r', 'a', 'd', 'm', 'i', 'n'];
        const lastTenKeys = newSequence.slice(-10);
        
        if (lastTenKeys.join('') === secretCode.join('')) {
          setSuperAdminMode(true);
          setSuccess('Super Admin registration unlocked! You can now add a new admin.');
          setKeySequence([]);
        }
        
    
        if (newSequence.length > 15) {
          setKeySequence([]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [keySequence, superAdminMode]);

  const validateForm = () => {
    if (superAdminMode) {
      if (!credentials.firstName.trim()) {
        setError('First name is required');
        return false;
      }
      if (!credentials.lastName.trim()) {
        setError('Last name is required');
        return false;
      }
      if (!credentials.username.trim()) {
        setError('Username is required');
        return false;
      }
      if (credentials.username.length < 3) {
        setError('Username must be at least 3 characters long');
        return false;
      }
      if (credentials.password !== credentials.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (credentials.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }

    if (!credentials.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!credentials.password.trim()) {
      setError('Password is required');
      return false;
    }

    return true;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    if (superAdminMode) {
      // Admin Registration (for super admin mode)
      try {
        const registrationData = {
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          username: credentials.username,
          email: credentials.email,
          password: credentials.password
        };
        
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/add-admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(registrationData),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Registration failed. Please try again.');
          setLoading(false);
          return;
        }

        setSuccess('New admin added successfully! Registration mode disabled.');
        
        setCredentials({
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        
     
        setTimeout(() => {
          setSuccess('');
          setSuperAdminMode(false);
        }, 2000);
        
      } catch (err) {
        console.error('Admin registration error:', err);
        setError('Failed to connect to the server.');
      }
    } else {
      // Admin Login
      try {
        const loginData = {
          email: credentials.email,
          password: credentials.password
        };
        
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
          credentials: 'include'
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Login failed');
          setLoading(false);
          return;
        }

        const admin = await response.json();

     
        const adminWithRole = {
          ...admin,
          role: admin.role || 'ADMIN', // Default to ADMIN if not set
          name: `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.username || admin.email
        };

        setCurrentUser(adminWithRole);
        navigate(admin.role === 'SUPER_ADMIN' ? '/manager/dashboard' : '/admin/dashboard');
        
      } catch (err) {
        console.error('Admin login error:', err);
        setError('Failed to connect to the server.');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-form admin-form">
        <div className="form-header">
          <Shield size={48} className="logo-icon admin-icon" />
          <h2>Admin Portal</h2>
          <p className="subtitle">Ronaldo's Rentals</p>
        </div>
        
        <h3>
          {superAdminMode ? 'Add New Admin (Super Admin Only)' : 'Admin Login'}
        </h3>
        
        {!superAdminMode && (
        <div className="info-message">
          <p>Please login with your admin credentials.</p>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 5px 0' }}>Forgot your password or need to change it?</p>
            <button
              type="button"
              className="link-button"
              onClick={() => navigate('/admin/change-password')}
              style={{ fontSize: '12px', padding: '5px 10px' }}
            >
              Change Password
            </button>
          </div>
        </div>
        )}
        
        {superAdminMode && (
          <div className="info-message">
            <p>🔓 Super Admin mode activated! You can now add a new admin account.</p>
            <button 
              type="button" 
              className="link-button" 
              onClick={() => {
                setSuperAdminMode(false);
                setSuccess('');
                setCredentials({
                  firstName: '',
                  lastName: '',
                  username: '',
                  email: '',
                  password: '',
                  confirmPassword: ''
                });
              }}
              style={{ fontSize: '12px', marginTop: '5px' }}
            >
              Cancel & Return to Login
            </button>
          </div>
        )}
        
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        
        <form onSubmit={handleAuth}>
          {superAdminMode && (
            <>
              <div className="form-group">
                <label htmlFor="firstName"><User size={20} /> First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={credentials.firstName}
                  onChange={(e) => setCredentials({ ...credentials, firstName: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="Enter your first name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName"><User size={20} /> Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={credentials.lastName}
                  onChange={(e) => setCredentials({ ...credentials, lastName: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="Enter your last name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="username"><User size={20} /> Username</label>
                <input
                  type="text"
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="Choose a username (min 3 characters)"
                />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="email"><Mail size={20} /> Email {!superAdminMode && '/ Username'}</label>
            <input
              type={superAdminMode ? "email" : "text"}
              id="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              required
              disabled={loading}
              placeholder={superAdminMode ? "Enter your email" : "Enter email or username"}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password"><Lock size={20} /> Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
                disabled={loading}
                placeholder={superAdminMode ? "Create password (min 6 characters)" : "Enter your password"}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          {superAdminMode && (
            <div className="form-group">
              <label htmlFor="confirmPassword"><Lock size={20} /> Confirm Password</label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={credentials.confirmPassword}
                  onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}
          
          <button type="submit" disabled={loading} className="admin-submit-btn">
            {loading ? (superAdminMode ? 'Creating Account...' : 'Logging in...') : (superAdminMode ? 'Create Admin Account' : 'Login')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;