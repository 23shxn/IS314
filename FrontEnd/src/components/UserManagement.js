import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Layout, Users, Car, ClipboardList, ToolCase } from 'lucide-react';
import '../styles/UserManagement.css';

const UserManagement = ({ setCurrentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.clear();
    sessionStorage.clear();
    setCurrentUser(null); // Clear the user state
    navigate('/login'); // Redirect to admin login
  };

  const handleNavigation = (path) => {
    navigate(`/admin/${path}`);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching users from http://localhost:8080/api/auth/users/customers');
      const response = await fetch('http://localhost:8080/api/auth/users/customers', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      console.log('Response status:', response.status);
      const text = await response.text();
      console.log('Raw response:', text);
      if (response.ok) {
        const data = JSON.parse(text);
        console.log('Parsed data:', data);
        setUsers(Array.isArray(data) ? data : []);
        setError('');
      } else {
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { error: `Non-JSON response (Status: ${response.status})` };
        }
        console.error('Error response:', errorData);
        setError(errorData.error || `Failed to fetch users (Status: ${response.status})`);
      }
    } catch (err) {
      console.error('Fetch error:', err.message);
      setError(`Failed to connect to the server: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isValidBase64 = (str) => {
    try {
      if (!str || typeof str !== 'string' || str.trim().length === 0) {
        return false;
      }
      
      // Check if it's a valid base64 string
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      return base64Regex.test(str) && str.length > 100; // Minimum length check
    } catch {
      return false;
    }
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
            <span>Pending Requests</span>
          </button>
          <button 
            onClick={() => handleNavigation('users')} 
            className={`sidebar-btn ${location.pathname === '/admin/users' ? 'active' : ''}`}
          >
            <Users className="btn-icon" />
            <span>User Management</span>
          </button>
          <button 
            onClick={() => handleNavigation('maintenance')} 
            className={`sidebar-btn ${location.pathname === '/admin/maintenance' ? 'active' : ''}`}
          >
            <ToolCase className="btn-icon" />
            <span>Maintenance</span>
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
        <div className="user-management">
          <div className="card">
            <h2>User Management</h2>
            {error && <p className="error-text">{error}</p>}
            {loading && <p>Loading...</p>}
            {!loading && users.length === 0 && <p>No users found.</p>}
            {users.length > 0 && (
              <div className="table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone Number</th>
                      <th>Driver's License</th>
                      <th>License Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{user.phoneNumber}</td>
                        <td>{user.driversLicenseNumber}</td>
                        <td>
                          {user.driversLicenseImage && isValidBase64(user.driversLicenseImage) ? (
                            <div className="image-container">
                              <img
                                src={`data:image/jpeg;base64,${user.driversLicenseImage}`}
                                alt={`${user.firstName}'s license`}
                                className="license-image"
                                style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'inline';
                                }}
                              />
                              <span style={{ display: 'none', color: '#999' }}>Invalid Image</span>
                            </div>
                          ) : (
                            <span style={{ color: '#999' }}>No Image</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
