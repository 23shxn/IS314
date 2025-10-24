import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Layout, Users, Car, ClipboardList, ToolCase, Check, X, Calendar } from 'lucide-react';
import '../styles/SuperAdminDashboard.css';

const PendingRequests = ({ setCurrentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPendingRequests();
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
    
    setCurrentUser(null);
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(`/manager/${path}`);
  };

  const fetchPendingRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/requests/pending`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(Array.isArray(data) ? data : []);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch pending requests');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Fetch pending requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/approve/${requestId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Approve response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Approve result:', result);
        setSuccessMessage(result.message || 'User approved successfully! Notification email sent.');
        setError('');
        fetchPendingRequests();
      } else {
        const errorData = await response.json();
        console.error('Approve error:', errorData);
        setError(errorData.error || 'Failed to approve user');
        setSuccessMessage('');
      }
    } catch (err) {
      console.error('Approve error:', err);
      setError('Failed to approve user: ' + err.message);
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/reject/${requestId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Reject response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Reject result:', result);
        setSuccessMessage(result.message || 'User rejected successfully! Notification email sent.');
        setError('');
        fetchPendingRequests();
      } else {
        const errorData = await response.json();
        console.error('Reject error:', errorData);
        setError(errorData.error || 'Failed to reject user');
        setSuccessMessage('');
      }
    } catch (err) {
      console.error('Reject error:', err);
      setError('Failed to reject user: ' + err.message);
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  const isValidBase64 = (str) => {
    try {
      return str && typeof str === 'string' && str.trim().length > 0 && !str.includes('data:');
    } catch {
      return false;
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
        <div className="pending-requests">
          <div className="card">
            <h2>Pending Registration Requests</h2>
            {error && <p className="error-text">{error}</p>}
            {successMessage && <p className="success-text">{successMessage}</p>}
            {loading && <p>Loading...</p>}
            {!loading && requests.length === 0 && <p>No pending requests.</p>}
            {requests.length > 0 && (
              <div className="table-container">
                <table className="requests-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone Number</th>
                      <th>Driver's License</th>
                      <th>License Image</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.firstName} {request.lastName}</td>
                        <td>{request.email}</td>
                        <td>{request.phoneNumber}</td>
                        <td>{request.driversLicenseNumber}</td>
                        <td>
                          {isValidBase64(request.driversLicenseImage) ? (
                            <a
                              href={`data:image/jpeg;base64,${request.driversLicenseImage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                cursor: 'pointer',
                                display: 'inline-block'
                              }}
                              onClick={(e) => {
                                
                                e.preventDefault();
                                const newWindow = window.open();
                                newWindow.document.write(`
                                  <html>
                                    <head><title>Driver's License - ${request.firstName} ${request.lastName}</title></head>
                                    <body style="margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0;">
                                      <img src="data:image/jpeg;base64,${request.driversLicenseImage}" 
                                           alt="Driver's License" 
                                           style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                                    </body>
                                  </html>
                                `);
                                newWindow.document.close();
                              }}
                            >
                              <img
                                src={`data:image/jpeg;base64,${request.driversLicenseImage}`}
                                alt={`${request.firstName}'s license`}
                                className="license-image"
                                style={{
                                  maxWidth: '80px',
                                  maxHeight: '60px',
                                  objectFit: 'cover',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.parentElement.querySelector('.no-image').style.display = 'inline';
                                }}
                              />
                            </a>
                          ) : (
                            <span className="no-image" style={{ display: 'inline', color: '#666' }}>No Image</span>
                          )}
                        </td>
                        <td>{request.status}</td>
                        <td className="table-actions">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="action-btn approve"
                            disabled={loading}
                            title="Approve"
                            style={{
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '10px',
                              margin: '0 4px',
                              width: '45px',
                              height: '45px',
                              cursor: 'pointer',
                              display: 'inline-block',
                              textAlign: 'center',
                              verticalAlign: 'middle',
                              position: 'relative'
                            }}
                          >
                            <Check style={{ width: '20px', height: '20px', color: 'white' }} />
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="action-btn reject"
                            disabled={loading}
                            title="Reject"
                            style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '10px',
                              margin: '0 4px',
                              width: '45px',
                              height: '45px',
                              cursor: 'pointer',
                              display: 'inline-block',
                              textAlign: 'center',
                              verticalAlign: 'middle',
                              position: 'relative'
                            }}
                          >
                            <X style={{ width: '20px', height: '20px', color: 'white' }} />
                          </button>
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

export default PendingRequests;