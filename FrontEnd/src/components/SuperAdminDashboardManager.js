import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Layout, Users, Car, ClipboardList, ToolCase, UserPlus, Check, X, Calendar } from 'lucide-react';
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
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: ''
  });

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

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/create-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
        credentials: 'include'
      });

      if (response.ok) {
        alert('Admin created successfully! Credentials have been emailed.');
        setShowCreateAdmin(false);
        setNewAdmin({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          password: ''
        });
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create admin');
      }
    } catch (err) {
      console.error('Create admin error:', err);
      alert('Failed to create admin');
    }
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
          
        </div>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-btn logout">
            <LogOut className="btn-icon" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="main-content">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>Super Admin Dashboard</h1>
            <button
              onClick={() => setShowCreateAdmin(true)}
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

          {/* Create Admin Modal */}
          {showCreateAdmin && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Create New Admin</h2>
                <form onSubmit={handleCreateAdmin} className="admin-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name *</label>
                      <input
                        type="text"
                        id="firstName"
                        value={newAdmin.firstName}
                        onChange={e => setNewAdmin({...newAdmin, firstName: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastName">Last Name *</label>
                      <input
                        type="text"
                        id="lastName"
                        value={newAdmin.lastName}
                        onChange={e => setNewAdmin({...newAdmin, lastName: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        value={newAdmin.email}
                        onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phoneNumber">Phone Number</label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        value={newAdmin.phoneNumber}
                        onChange={e => setNewAdmin({...newAdmin, phoneNumber: e.target.value})}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="password">Temporary Password *</label>
                      <input
                        type="password"
                        id="password"
                        value={newAdmin.password}
                        onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                        className="form-input"
                        required
                        minLength="6"
                      />
                      <small className="form-hint">Admin will receive login credentials via email</small>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary">
                      Create Admin
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowCreateAdmin(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}



          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading-message">Loading dashboard...</div>}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardModified;
