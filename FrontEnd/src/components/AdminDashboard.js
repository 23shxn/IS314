import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import '../styles/AdminDashboard.css';

const AdminDashboard = ({ currentUser, cars, reservations, users }) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('dashboard');

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <h2>Admin Dashboard</h2>
        <button onClick={() => setCurrentView('dashboard')} className="sidebar-btn">Dashboard</button>
        <button onClick={() => navigate('/admin/vehicles')} className="sidebar-btn">Vehicle Management</button>
        <button onClick={() => navigate('/admin/pending-requests')} className="sidebar-btn">Pending Requests</button>
        <button onClick={() => navigate('/admin/users')} className="sidebar-btn">User Management</button>
        <button onClick={() => navigate('/admin/maintenance')} className="sidebar-btn">Maintenance</button>
        <button onClick={handleLogout} className="sidebar-btn logout">
          <LogOut className="btn-icon" /> Logout
        </button>
      </div>
      <div className="main-content">
        {currentView === 'dashboard' && (
          <div>
            <h2>Dashboard Overview</h2>
            <p>Welcome to the admin dashboard. Use the sidebar to manage vehicles, review pending registration requests, manage users, or manage maintenance.</p>
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Total Vehicles</h3>
                <p>{cars?.length || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Total Reservations</h3>
                <p>{reservations?.length || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Total Users</h3>
                <p>{users?.length || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;