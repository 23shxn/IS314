import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import '../styles/PendingRequests.css';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/auth/requests/pending', {
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

  const handleApproveRequest = async (id) => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/auth/approve/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (response.ok) {
        setRequests(requests.filter(r => r.id !== id));
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to approve request');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Approve request error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (id) => {
    if (!window.confirm('Are you sure you want to reject this registration request?')) {
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/auth/reject/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (response.ok) {
        setRequests(requests.filter(r => r.id !== id));
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to reject request');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Reject request error:', err);
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
    <div className="pending-requests">
      <div className="card">
        <h2>Pending Registration Requests</h2>
        {error && <p className="error-text">{error}</p>}
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
                        >
                          <img
                            src={`data:image/jpeg;base64,${request.driversLicenseImage}`}
                            alt={`${request.firstName}'s license`}
                            className="license-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.nextSibling.style.display = 'inline';
                            }}
                          />
                        </a>
                      ) : (
                        <span style={{ display: 'inline' }}>No Image</span>
                      )}
                      <span style={{ display: 'none' }}>Invalid Image</span>
                    </td>
                    <td>{request.status}</td>
                    <td className="table-actions">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="action-btn approve"
                        disabled={loading}
                      >
                        <Check className="action-icon" />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="action-btn reject"
                        disabled={loading}
                      >
                        <X className="action-icon" />
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
  );
};

export default PendingRequests;