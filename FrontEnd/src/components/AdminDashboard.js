
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Layout, Users, Car, ClipboardList, ToolCase, Calendar, Lock } from 'lucide-react';
import '../styles/AdminDashboard.css';

const AdminDashboard = ({ currentUser, cars, reservations, users, pendingRequests, setCurrentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleLogout = () => {
    console.log('Logging out from Admin Dashboard');
    setCurrentUser(null); // Clear the user state
    navigate('/login'); // Redirect to admin login page
  };

  const handleNavigation = (path) => {
    setCurrentView(path);
    navigate(`/admin/${path}`);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setShowChangePassword(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch (error) {
      setPasswordError('Network error. Please try again.');
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="admin-dashboard">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Ronaldo's Rentals Admin Dashboard</h2>
        </div>
        <div className="sidebar-menu">
          <button
            onClick={() => handleNavigation('dashboard')}
            className={`sidebar-btn ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
          >
            <Layout className="btn-icon" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => handleNavigation('vehicles')}
            className={`sidebar-btn ${location.pathname === '/admin/vehicles' ? 'active' : ''}`}
          >
            <Car className="btn-icon" />
            <span>Vehicle Management</span>
          </button>
          <button
            onClick={() => handleNavigation('pending-requests')}
            className={`sidebar-btn ${location.pathname === '/admin/pending-requests' ? 'active' : ''}`}
          >
            <ClipboardList className="btn-icon" />
            <span>Pending User Requests</span>
          </button>
          <button
            onClick={() => handleNavigation('users')}
            className={`sidebar-btn ${location.pathname === '/admin/users' ? 'active' : ''}`}
          >
            <Users className="btn-icon" />
            <span>Customer Information</span>
          </button>
          
          <button
            onClick={() => handleNavigation('maintenance')}
            className={`sidebar-btn ${location.pathname === '/admin/maintenance' ? 'active' : ''}`}
          >
            <ToolCase className="btn-icon" />
            <span>Maintenance</span>
          </button>
          <button
            onClick={() => handleNavigation('reservations')}
            className={`sidebar-btn ${location.pathname === '/admin/reservations' ? 'active' : ''}`}
          >
            <Calendar className="btn-icon" />
            <span>Reservations</span>
          </button>
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className={`sidebar-btn ${showChangePassword ? 'active' : ''}`}
          >
            <Lock className="btn-icon" />
            <span>Change Password</span>
          </button>
        </div>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-btn logout">
            <LogOut className="btn-icon" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
      <div className="main-content">
        {showChangePassword && (
          <div className="change-password-section">
            <h2>Change Password</h2>
            <form onSubmit={handleChangePassword} className="change-password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  required
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  required
                  minLength="6"
                />
              </div>
              {passwordError && <div className="error-message">{passwordError}</div>}
              {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
              <div className="form-actions">
                <button type="submit" className="btn-primary">Change Password</button>
                <button type="button" onClick={() => setShowChangePassword(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}
        {currentView === 'dashboard' && !showChangePassword && (
          <div>
            <h2>Dashboard Overview</h2>
            <p>Welcome to the admin dashboard. Use the sidebar to manage vehicles, review pending user registration requests, manage customers, view reservations, or manage maintenance.</p>
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Total Vehicles</h3>
                <p>{cars.length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Reservations</h3>
                <p>{reservations.length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Users</h3>
                <p>{users.length}</p>
              </div>
              <div className="stat-card">
                <h3>Pending User Requests</h3>
                <p>{pendingRequests.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
