import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, User, Shield, Mail, Key } from 'lucide-react';
import '../styles/LoginForm.css';

// Move NewPasswordPage outside of LoginForm component
const NewPasswordPage = ({ 
  error, 
  success, 
  newPassword, 
  setNewPassword, 
  confirmNewPassword, 
  setConfirmNewPassword, 
  handleResetPassword, 
  loading, 
  setShowNewPasswordPage, 
  setResetEmail, 
  setResetCode, 
  setError, 
  setSuccess 
}) => {
  return (
    <div className="login-container">
      <div className="login-form">
        <div className="form-header">
          <Car size={48} className="logo-icon" />
          <h2>Ronaldo's Rentals</h2>
        </div>
        <h3>Create New Password</h3>
        <p>Reset code verified! Please enter your new password.</p>
        
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        
        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            <label htmlFor="newPassword"><Key size={20} /> New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmNewPassword"><Key size={20} /> Confirm New Password</label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
        
        <div className="auth-toggle">
          <p>
            Remember your password?
            <button 
              type="button"
              className="link-button" 
              onClick={() => {
                setShowNewPasswordPage(false);
                setResetEmail('');
                setResetCode('');
                setNewPassword('');
                setConfirmNewPassword('');
                setError('');
                setSuccess('');
              }}
              disabled={loading}
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

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
  const [imageLoading, setImageLoading] = useState(false); // Add this new state
  
  // Email verification state
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  
  // Move these to component level instead of inside modal
  const [codes, setCodes] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showResetCodeVerification, setShowResetCodeVerification] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetCodes, setResetCodes] = useState(['', '', '', '', '', '']);
  const resetInputRefs = useRef([]);

  // Add new state for the password page
  const [showNewPasswordPage, setShowNewPasswordPage] = useState(false);

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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/send-verification`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/verify-code `, {
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
    try {
      // Send as JSON, not FormData
      const registrationData = {
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        phoneNumber: credentials.phoneNumber,
        email: credentials.email,
        password: credentials.password,
        confirmPassword: credentials.confirmPassword,
        driversLicenseNumber: credentials.driversLicenseNumber,
        driversLicenseImage: credentials.driversLicenseImage // This is already base64 string
      };

      console.log('Sending registration data:', { ...registrationData, driversLicenseImage: 'base64_string', password: '[HIDDEN]' });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' // Send as JSON
        },
        body: JSON.stringify(registrationData), // Send as JSON string
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

  // Password reset functions - optimized to prevent re-renders
  const handleRequestPasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateEmail(resetEmail)) {
      setError('Please enter a valid Gmail address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset code');
        setLoading(false);
        return;
      }

      setSuccess('Reset code sent to your email!');
      setError(''); // Clear any previous errors
      setShowPasswordReset(false);
      setShowResetCodeVerification(true);
    } catch (err) {
      setError('Failed to send reset code. Please try again.');
      console.error('Password reset request error:', err);
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (resetCode.length !== 6) {
      setError('Please enter the complete 6-digit reset code');
      setLoading(false);
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('Password must be at least 8 characters, including uppercase, lowercase, number, and special character');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: resetEmail, 
          resetToken: resetCode,
          newPassword: newPassword
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        setLoading(false);
        return;
      }

      setSuccess('Password reset successful! You can now login with your new password.');
      // Clear all reset-related state
      setShowResetCodeVerification(false);
      setShowPasswordReset(false);
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setResetCodes(['', '', '', '', '', '']);
      setError('');
    } catch (err) {
      setError('Failed to reset password. Please try again.');
      console.error('Password reset error:', err);
    }
    setLoading(false);
  };

  // New handler to verify code only
  const handleCodeVerification = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (resetCode.length !== 6) {
      setError('Please enter the complete 6-digit reset code');
      setLoading(false);
      return;
    }

    try {
      // Verify the reset code with the backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: resetEmail, 
          resetToken: resetCode
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid or expired reset code');
        setLoading(false);
        return;
      }

      // Code is valid, proceed to password reset page
      setSuccess('Code verified! Redirecting to password reset...');
      setError('');
      
      // Hide modal and show new password page after a short delay
      setTimeout(() => {
        setShowResetCodeVerification(false);
        setShowNewPasswordPage(true);
        setSuccess(''); // Clear success message for new page
      }, 1500);

    } catch (err) {
      setError('Failed to verify reset code. Please check your connection and try again.');
      console.error('Code verification error:', err);
    }
    
    setLoading(false);
  };

  // Optimized reset code handlers
  const handleResetCodeChange = useCallback((index, value) => {
    if (value.length > 1) return;
    
    setResetCodes(prevCodes => {
      const newCodes = [...prevCodes];
      newCodes[index] = value;
      setResetCode(newCodes.join(''));
      
      if (value && index < 5) {
        setTimeout(() => {
          resetInputRefs.current[index + 1]?.focus();
        }, 0);
      }
      
      return newCodes;
    });
  }, []); // Empty dependency array

  const handleResetKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace') {
      setResetCodes(prevCodes => {
        if (!prevCodes[index] && index > 0) {
          setTimeout(() => {
            resetInputRefs.current[index - 1]?.focus();
          }, 0);
        }
        return prevCodes;
      });
    }
  }, []); // Empty dependency array

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

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
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

  // Add image compression function
  const compressImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.7) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Modify your existing handleFileChange function
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageLoading(true);
      try {
        console.log('Original file size:', file.size, 'bytes');
        
        // Compress the image
        const compressedDataUrl = await compressImage(file);
        
        // Convert to base64 (remove data URL prefix)
        const base64String = compressedDataUrl.split(',')[1];
        
        console.log('Compressed image size:', base64String.length * 0.75, 'bytes (approx)');
        
        setCredentials({
          ...credentials,
          driversLicenseImage: base64String
        });
        
      } catch (error) {
        console.error('Image compression error:', error);
        setError('Failed to process image. Please try a different image.');
      } finally {
        setImageLoading(false);
      }
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

  // Remove the useCallback wrapper from PasswordResetModal
  const PasswordResetModal = () => {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3><Key size={24} /> Reset Password</h3>
          <p>Enter your email address to receive a password reset code:</p>
          
          <form onSubmit={handleRequestPasswordReset}>
            <div className="form-group">
              <label htmlFor="resetEmail">Email Address</label>
              <input
                type="email"
                id="resetEmail"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                required
                disabled={loading}
                autoFocus
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="modal-buttons">
              <button type="submit" disabled={loading || !resetEmail}>
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowPasswordReset(false);
                  setResetEmail('');
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
  };

  // Replace ResetCodeVerificationModal with the new implementation
  const ResetCodeVerificationModal = () => {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3><Key size={24} /> Enter Reset Code</h3>
          <p>We've sent a 6-digit reset code to:</p>
          <p><strong>{resetEmail}</strong></p>
          
          <form onSubmit={handleCodeVerification}>
            <div className="form-group">
              <label htmlFor="resetCode">Reset Code</label>
              <input
                type="text"
                id="resetCode"
                value={resetCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setResetCode(value);
                }}
                placeholder="Enter 6-digit code"
                maxLength="6"
                className="code-input-single"
                disabled={loading}
                autoFocus
                style={{
                  textAlign: 'center',
                  letterSpacing: '0.5em',
                  fontSize: '18px',
                  padding: '12px',
                  width: '200px',
                  margin: '0 auto',
                  display: 'block'
                }}
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="modal-buttons">
              <button type="submit" disabled={loading || resetCode.length !== 6}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button 
                type="button" 
                onClick={() => handleRequestPasswordReset({ preventDefault: () => {} })}
                disabled={loading}
                className="secondary-button"
              >
                Resend Code
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowResetCodeVerification(false);
                  setShowPasswordReset(false);
                  setResetEmail('');
                  setResetCode('');
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
  };

  return (
    <div className="login-container">
      {showEmailVerification && <EmailVerificationModal />}
      {showPasswordReset && <PasswordResetModal />}
      {showResetCodeVerification && <ResetCodeVerificationModal />}
      
      {showNewPasswordPage ? (
        <NewPasswordPage 
          error={error}
          success={success}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmNewPassword={confirmNewPassword}
          setConfirmNewPassword={setConfirmNewPassword}
          handleResetPassword={handleResetPassword}
          loading={loading}
          setShowNewPasswordPage={setShowNewPasswordPage}
          setResetEmail={setResetEmail}
          setResetCode={setResetCode}
          setError={setError}
          setSuccess={setSuccess}
        />
      ) : (
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
                    disabled={loading || imageLoading}
                  />
                  {imageLoading && (
                    <p className="processing-message" style={{ color: '#007bff', fontSize: '12px', marginTop: '5px' }}>
                      📷 Compressing image...
                    </p>
                  )}
                  {credentials.driversLicenseImage && !imageLoading && (
                    <p className="file-selected" style={{ color: '#28a745', fontSize: '12px', marginTop: '5px' }}>
                      ✅ Image processed and ready
                    </p>
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
          {!isRegister && (
            <div className="forgot-password">
              <button 
                type="button"
                className="link-button" 
                onClick={() => setShowPasswordReset(true)}
                disabled={loading}
              >
                Forgot your password?
              </button>
            </div>
          )}
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
      )}
    </div>
  );
};

export default LoginForm;