import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Layout, Users, Car, ClipboardList, ToolCase, UserPlus, Check, X, Calendar, Lock } from 'lucide-react';
import '../styles/SuperAdminDashboard.css';

const SuperAdminDashboardModified = ({ setCurrentUser, currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    pendingRequests: 0,
    pendingMaintenance: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');


  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.clear();
    sessionStorage.clear();
    setCurrentUser(null);
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(`/manager/${path}`);
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch pending requests count
      const pendingResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicles/pending/all`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      // Fetch pending maintenance count
      const maintenanceResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/maintenance/pending/all`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      // Fetch vehicle stats
      const vehicleResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicles/all`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      // Fetch user stats
      const userResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/users/customers`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const pendingData = pendingResponse.ok ? await pendingResponse.json() : [];
      const maintenanceData = maintenanceResponse.ok ? await maintenanceResponse.json() : [];
      const vehicleData = vehicleResponse.ok ? await vehicleResponse.json() : [];
      const userData = userResponse.ok ? await userResponse.json() : [];

      setStats({
        totalUsers: Array.isArray(userData) ? userData.length : 0,
        totalVehicles: Array.isArray(vehicleData) ? vehicleData.length : 0,
        pendingRequests: Array.isArray(pendingData) ? pendingData.length : 0,
        pendingMaintenance: Array.isArray(maintenanceData) ? maintenanceData.length : 0
      });

      setError('');
    } catch (err) {
      console.error('Fetch stats error:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/change-password`, {
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
          <h2>Ronaldo's Rentals Super Admin Dashboard</h2>
        </div>
        <div className="sidebar-menu">
          <button
            onClick={() => handleNavigation('dashboard')}
            className={`sidebar-btn ${location.pathname === '/manager/dashboard' ? 'active' : ''}`}
          >
            <Layout className="btn-icon" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => handleNavigation('vehicles')}
            className={`sidebar-btn ${location.pathname === '/manager/vehicles' ? 'active' : ''}`}
          >
            <Car className="btn-icon" />
            <span>Vehicle Management</span>
          </button>
          <button
            onClick={() => handleNavigation('pending-requests')}
            className={`sidebar-btn ${location.pathname === '/manager/pending-requests' ? 'active' : ''}`}
          >
            <ClipboardList className="btn-icon" />
            <span>Pending User Requests</span>
          </button>
          <button
            onClick={() => handleNavigation('users')}
            className={`sidebar-btn ${location.pathname === '/manager/users' ? 'active' : ''}`}
          >
            <Users className="btn-icon" />
            <span>User Management</span>
          </button>
          
          <button
            onClick={() => handleNavigation('maintenance')}
            className={`sidebar-btn ${location.pathname === '/manager/maintenance' ? 'active' : ''}`}
          >
            <ToolCase className="btn-icon" />
            <span>Maintenance</span>
          </button>
          <button
            onClick={() => handleNavigation('reservations')}
            className={`sidebar-btn ${location.pathname === '/manager/reservations' ? 'active' : ''}`}
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
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>Super Admin Dashboard</h1>
            <button
              onClick={() => navigate('/manager/add-admin')}
              className="btn-primary"
            >
              <UserPlus className="btn-icon" />
              Create Admin
            </button>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Car size={24} />
              </div>
              <div className="stat-content">
                <h3>{stats.totalVehicles}</h3>
                <p>Total Vehicles</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <ClipboardList size={24} />
              </div>
              <div className="stat-content">
                <h3>{stats.pendingRequests}</h3>
                <p>Pending Vehicle Requests</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <ToolCase size={24} />
              </div>
              <div className="stat-content">
                <h3>{stats.pendingMaintenance}</h3>
                <p>Pending Maintenance</p>
              </div>
            </div>
          </div>





          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading-message">Loading dashboard...</div>}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardModified;