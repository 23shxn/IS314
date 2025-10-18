import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Layout, Users, Car, ClipboardList, ToolCase, Trash2, UserPlus, Calendar } from 'lucide-react';
import '../styles/UserManagement.css';

const UserManagement = ({ setCurrentUser, currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation()
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Determine user role
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN'
  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    fetchUsers();
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
    setCurrentUser(null); // Clear the user state
    navigate('/login'); // Redirect to admin login
  };

  const handleNavigation = (path) => {
    if (isSuperAdmin) {
      navigate(`/manager/${path}`);
    } else {
      navigate(`/admin/${path}`);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching users from${process.env.REACT_APP_API_URL}/api/auth/users/customers');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/users/customers`, {
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

  const handleDeleteUser = async (userId) => {
    if (!isSuperAdmin) {
      alert('Only super admins can delete users');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        alert('User deleted successfully');
        fetchUsers(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Failed to delete user');
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
          <h2>Ronaldo's Rentals {isSuperAdmin ? 'Super Admin' : 'Admin'} Dashboard</h2>
        </div>
        <div className="sidebar-menu">
          <button
            onClick={() => handleNavigation('dashboard')}
            className={`sidebar-btn ${location.pathname === `/${isSuperAdmin ? 'manager' : 'admin'}/dashboard` ? 'active' : ''}`}
          >
            <Layout className="btn-icon" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => handleNavigation('vehicles')}
            className={`sidebar-btn ${location.pathname === `/${isSuperAdmin ? 'manager' : 'admin'}/vehicles` ? 'active' : ''}`}
          >
            <Car className="btn-icon" />
            <span>Vehicle Management</span>
          </button>
          {isSuperAdmin ? (
            <>
              <button
                onClick={() => handleNavigation('users')}
                className={`sidebar-btn ${location.pathname === '/manager/users' ? 'active' : ''}`}
              >
                <Users className="btn-icon" />
                <span>User Management</span>
              </button>
              <button
                onClick={() => handleNavigation('pending-requests')}
                className={`sidebar-btn ${location.pathname === '/manager/pending-requests' ? 'active' : ''}`}
              >
                <ClipboardList className="btn-icon" />
                <span>Pending Requests</span>
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
            </>
          ) : (
            <>
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
                <span>Customer Infromation</span>
              </button>
              
              <button
                onClick={() => handleNavigation('maintenance')}
                className={`sidebar-btn ${location.pathname === '/admin/maintenance' ? 'active' : ''}`}
              >
                <ToolCase className="btn-icon" />
                <span>Maintenance</span>
              </button><button
                onClick={() => handleNavigation('reservations')}
                className={`sidebar-btn ${location.pathname === '/admin/reservations' ? 'active' : ''}`}
              >
                <Calendar className="btn-icon" />
                <span>Reservations</span>
              </button>
              
            </>
          )}
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
            <h2>Customer Information</h2>
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
                      {isSuperAdmin && <th>Actions</th>}
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
                        {isSuperAdmin && (
                          <td>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="action-btn delete"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
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
