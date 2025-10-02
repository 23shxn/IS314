import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, User, Shield, Mail } from 'lucide-react';
import '../styles/LoginForm.css';

const LoginForm = ({ setCurrentUser }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    driversLicenseNumber: '',
    driversLicenseImage: null
  });
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Email verification state
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  
  // Move these to component level instead of inside modal
  const [codes, setCodes] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\d{7}$/;
    return phoneRegex.test(phoneNumber);
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // New function to send verification code
  const handleSendVerification = async (email) => {
    try {
      const response = await fetch('http://localhost:8080/api/email/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send verification email');
        return false;
      }

      setSuccess('Verification email sent! Please check your inbox.');
      return true;
    } catch (err) {
      setError('Failed to send verification email. Please try again.');
      console.error('Email verification error:', err);
      return false;
    }
  };

  // New function to verify email code
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/email/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: registrationEmail, 
          code: verificationCode 
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid verification code');
        setLoading(false);
        return;
      }

      setSuccess('Email verified successfully!');
      setEmailVerified(true);
      setShowEmailVerification(false);
      setVerificationCode('');
      
      // Continue with registration after email verification
      await proceedWithRegistration();
    } catch (err) {
      setError('Failed to verify email. Please try again.');
      console.error('Email verification error:', err);
    }
    setLoading(false);
  };

  // New function to proceed with registration after email verification
  const proceedWithRegistration = async () => {
    const formData = new FormData();
    formData.append('firstName', credentials.firstName);
    formData.append('lastName', credentials.lastName);
    formData.append('phoneNumber', credentials.phoneNumber);
    formData.append('email', credentials.email);
    formData.append('password', credentials.password);
    formData.append('confirmPassword', credentials.confirmPassword);
    formData.append('driversLicenseNumber', credentials.driversLicenseNumber);
    formData.append('driversLicenseImage', credentials.driversLicenseImage);

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      setSuccess('Registration completed successfully. Awaiting admin approval.');
      setCredentials({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        driversLicenseNumber: '',
        driversLicenseImage: null
      });
      const fileInput = document.getElementById('driversLicenseImage');
      if (fileInput) fileInput.value = '';
      setEmailVerified(false);
    } catch (err) {
      setError('Failed to complete registration. Please try again.');
      console.error('Registration error:', err);
    }
  };

  // Modified handleAuth function
  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isRegister) {
      // Frontend validation for registration
      if (!validateName(credentials.firstName)) {
        setError('First name must contain only letters and spaces');
        setLoading(false);
        return;
      }

      if (!validateName(credentials.lastName)) {
        setError('Last name must contain only letters and spaces');
        setLoading(false);
        return;
      }

      if (!validatePhoneNumber(credentials.phoneNumber)) {
        setError('Phone number must be exactly 7 digits');
        setLoading(false);
        return;
      }

      if (!validateEmail(credentials.email)) {
        setError('Email must end with @gmail.com');
        setLoading(false);
        return;
      }

      if (!validatePassword(credentials.password)) {
        setError('Password must be at least 8 characters, including uppercase, lowercase, number, and special character');
        setLoading(false);
        return;
      }

      if (credentials.password !== credentials.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (!credentials.driversLicenseImage) {
        setError('Please upload a driver\'s license image');
        setLoading(false);
        return;
      }

      // NEW: Send email verification before proceeding with registration
      setRegistrationEmail(credentials.email);
      const verificationSent = await handleSendVerification(credentials.email);
      if (verificationSent) {
        setShowEmailVerification(true);
      }
    } else {
      // Login
      if (!validateEmail(credentials.email)) {
        setError('Email must end with @gmail.com');
        setLoading(false);
        return;
      }

      try {
        const loginData = {
          email: credentials.email,
          password: credentials.password
        };

        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Ensure session cookie is sent
          body: JSON.stringify(loginData)
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Login failed');
          setLoading(false);
          return;
        }

        const user = await response.json();
        const userWithDetails = {
          ...user,
          role: 'customer',
          name: `${user.firstName} ${user.lastName}`.trim() || user.email,
          id: user.id // Ensure id is included
        };

        console.log('Login successful, user:', userWithDetails);
        setCurrentUser(userWithDetails);

        // Navigate to dashboard or returnTo route if provided
        const returnTo = navigate.location?.state?.returnTo || '/dashboard';
        navigate(returnTo, { state: navigate.location?.state });
      } catch (err) {
        setError('Failed to connect to the server. Please check your connection.');
        console.error('Login error:', err);
      }
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        e.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        e.target.value = '';
        return;
      }

      setCredentials({ ...credentials, driversLicenseImage: file });
      setError('');
    }
  };

  const handleToggleForm = () => {
    setIsRegister(!isRegister);
    setError('');
    setSuccess('');
    setCredentials({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
      driversLicenseNumber: '',
      driversLicenseImage: null
    });
    const fileInput = document.getElementById('driversLicenseImage');
    if (fileInput) fileInput.value = '';
  };

  // Memoized handlers to prevent re-renders
  const handleCodeChange = useCallback((index, value) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    setCodes(prevCodes => {
      const newCodes = [...prevCodes];
      newCodes[index] = value;
      
      // Update the main verification code
      setVerificationCode(newCodes.join(''));
      
      // Auto-focus next input
      if (value && index < 5) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 0);
      }
      
      return newCodes;
    });
  }, []);

  const handleKeyDown = useCallback((index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 0);
    }
  }, [codes]);

  // Memoized EmailVerificationModal component
  const EmailVerificationModal = useCallback(() => {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3><Mail size={24} /> Email Verification</h3>
          <p>We've sent a verification code to:</p>
          <p><strong>{registrationEmail}</strong></p>
          <p>Please enter the 6-digit code below:</p>
          
          <form onSubmit={handleVerifyEmail}>
            <div className="code-inputs">
              {codes.map((code, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    if (el) {
                      inputRefs.current[index] = el;
                    }
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={code}
                  onChange={(e) => {
                    e.preventDefault();
                    const numericValue = e.target.value.replace(/\D/g, '');
                    handleCodeChange(index, numericValue);
                  }}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                    if (pastedData) {
                      const newCodes = pastedData.split('').concat(['', '', '', '', '', '']).slice(0, 6);
                      setCodes(newCodes);
                      setVerificationCode(newCodes.join(''));
                    }
                  }}
                  maxLength="1"
                  className="code-input"
                  disabled={loading}
                  autoFocus={index === 0}
                  autoComplete="off"
                />
              ))}
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="modal-buttons">
              <button type="submit" disabled={loading || verificationCode.length !== 6}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
              <button 
                type="button" 
                onClick={() => handleSendVerification(registrationEmail)}
                disabled={loading}
                className="secondary-button"
              >
                Resend Code
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowEmailVerification(false);
                  setVerificationCode('');
                  setCodes(['', '', '', '', '', '']);
                  setLoading(false);
                  setError('');
                  setSuccess('');
                }}
                disabled={loading}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }, [codes, registrationEmail, error, success, loading, verificationCode, handleCodeChange, handleKeyDown, handleVerifyEmail, handleSendVerification]);

  return (
    <div className="login-container">
      {showEmailVerification && <EmailVerificationModal />}
      
      <div className="login-form">
        <div className="form-header">
          <Car size={48} className="logo-icon" />
          <h2>Ronaldo's Rentals</h2>
        </div>
        <h3>{isRegister ? 'Customer Registration' : 'Customer Login'}</h3>
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
                />
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber"><User size={20} /> Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={credentials.phoneNumber}
                  onChange={(e) => setCredentials({ ...credentials, phoneNumber: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="driversLicenseNumber"><User size={20} /> Driver's License Number</label>
                <input
                  type="text"
                  id="driversLicenseNumber"
                  value={credentials.driversLicenseNumber}
                  onChange={(e) => setCredentials({ ...credentials, driversLicenseNumber: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="driversLicenseImage"><User size={20} /> Driver's License Image</label>
                <input
                  type="file"
                  id="driversLicenseImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  disabled={loading}
                />
                {credentials.driversLicenseImage && (
                  <p className="file-selected">Selected: {credentials.driversLicenseImage.name}</p>
                )}
              </div>
            </>
          )}
          <div className="form-group">
            <label htmlFor="email"><User size={20} /> Email</label>
            <input
              type="email"
              id="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password"><User size={20} /> Password</label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="confirmPassword"><User size={20} /> Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={credentials.confirmPassword}
                onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          )}
          <button type="submit" disabled={loading}>
            {loading ? (isRegister ? 'Registering...' : 'Logging in...') : (isRegister ? 'Register' : 'Login')}
          </button>
        </form>
        <div className="auth-toggle">
          <p>
            {isRegister ? 'Already have an account?' : 'Need an account?'}
            <button 
              type="button"
              className="link-button" 
              onClick={handleToggleForm}
              disabled={loading}
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
        </div>
        
        <div className="admin-access">
          <hr style={{ margin: '20px 0', borderColor: '#ddd' }} />
          <p style={{ textAlign: 'center', margin: '10px 0', color: '#666' }}>
            Administrator Access
          </p>
          <button 
            type="button"
            className="admin-login-btn" 
            onClick={() => navigate('/admin/login')}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#2c3e50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Shield size={20} />
            Admin Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;