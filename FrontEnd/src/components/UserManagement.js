import React, { useState, useEffect } from 'react';
import '../styles/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

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
      return str && typeof str === 'string' && str.trim().length > 0 && !str.includes('data:');
    } catch {
      return false;
    }
  };

  return (
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
                      {isValidBase64(user.driversLicenseImage) ? (
                        <a
                          href={`data:image/jpeg;base64,${user.driversLicenseImage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={`data:image/jpeg;base64,${user.driversLicenseImage}`}
                            alt={`${user.firstName}'s license`}
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

export default UserManagement;