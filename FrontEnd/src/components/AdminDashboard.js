
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Layout, Users, Car, ClipboardList, ToolCase, Calendar } from 'lucide-react';
import '../styles/AdminDashboard.css';

const AdminDashboard = ({ currentUser, cars, reservations, users, pendingRequests, setCurrentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState('dashboard');

  const handleLogout = () => {
    console.log('Logging out from Admin Dashboard');
    setCurrentUser(null); // Clear the user state
    navigate('/login'); // Redirect to admin login page
  };

  const handleNavigation = (path) => {
    setCurrentView(path);
    navigate(`/admin/${path}`);
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
        </div>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-btn logout">
            <LogOut className="btn-icon" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
      <div className="main-content">
        {currentView === 'dashboard' && (
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
