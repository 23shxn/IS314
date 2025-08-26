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
  const [isRegister, setIsRegister] = useState(false);
  const [isFirstAdmin, setIsFirstAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    checkFirstAdmin();
  }, []);

  const checkFirstAdmin = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/admin/is-first-admin", {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setIsFirstAdmin(data.isFirstAdmin);
        if (data.isFirstAdmin) {
          setIsRegister(true); // Force registration mode for first admin
        }
      }
    } catch (err) {
      console.error('Error checking first admin status:', err);
    }
  };

  const validateForm = () => {
    if (isRegister) {
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

    if (isRegister) {
      // Admin Registration
      try {
        const registrationData = {
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          username: credentials.username,
          email: credentials.email,
          password: credentials.password
        };
        
        const response = await fetch('http://localhost:8080/api/admin/register', {
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

        setSuccess('Admin account created successfully! You can now login.');
        setCredentials({
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        
        // Switch to login mode after successful registration
        setTimeout(() => {
          setIsRegister(false);
          setSuccess('');
          checkFirstAdmin(); // Recheck first admin status
        }, 2000);
        
      } catch (err) {
        console.error('Admin registration error:', err);
        setError('Failed to connect to the server.');
      }
    } else {
      // Admin Login
      try {
        const loginData = {
          emailOrUsername: credentials.email,
          password: credentials.password
        };
        
        const response = await fetch('http://localhost:8080/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(loginData),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Login failed');
          setLoading(false);
          return;
        }

        const admin = await response.json();
        
        // Ensure the admin object has the role property
        const adminWithRole = {
          ...admin,
          role: 'admin',
          name: `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.username || admin.email
        };
        
        setCurrentUser(adminWithRole);
        navigate('/admin/dashboard');
        
      } catch (err) {
        console.error('Admin login error:', err);
        setError('Failed to connect to the server.');
      }
    }
    
    setLoading(false);
  };

  const handleToggleForm = () => {
    if (!isFirstAdmin) { // Only allow toggle if not first admin
      setIsRegister(!isRegister);
      setError('');
      setSuccess('');
      setCredentials({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-form admin-form">
        <div className="form-header">
          <Shield size={48} className="logo-icon admin-icon" />
          <h2>Admin Portal</h2>
          <p className="subtitle">Ronaldo's Ravishing Rentals</p>
        </div>
        
        <h3>
          {isFirstAdmin ? 'Create First Admin Account' : (isRegister ? 'Register Admin' : 'Admin Login')}
        </h3>
        
        {isFirstAdmin && (
          <div className="info-message">
            <p>Welcome! Create the first admin account to get started.</p>
          </div>
        )}
        
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        
        <form onSubmit={handleAuth}>
          {isRegister && (
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
            <label htmlFor="email"><Mail size={20} /> Email {!isRegister && '/ Username'}</label>
            <input
              type={isRegister ? "email" : "text"}
              id="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              required
              disabled={loading}
              placeholder={isRegister ? "Enter your email" : "Enter email or username"}
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
                placeholder={isRegister ? "Create password (min 6 characters)" : "Enter your password"}
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
          
          {isRegister && (
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
            {loading ? (isRegister ? 'Creating Account...' : 'Logging in...') : (isRegister ? 'Create Admin Account' : 'Login')}
          </button>
        </form>
        
        {!isFirstAdmin && (
          <div className="auth-toggle">
            <p>
              {isRegister ? 'Already have an admin account?' : 'Need to create an admin account?'}
              <button 
                type="button"
                className="link-button" 
                onClick={handleToggleForm}
                disabled={loading}
              >
                {isRegister ? 'Login here' : 'Register here'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;