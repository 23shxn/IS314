import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Check, X } from 'lucide-react';
import '../styles/AddAdmin.css';

const AddAdminManager = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/create-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess('Admin created successfully! Credentials have been emailed.');
        setNewAdmin({
          username: '',
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          password: ''
        });
        // Redirect back to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/manager/dashboard');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create admin');
      }
    } catch (err) {
      console.error('Create admin error:', err);
      setError('Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/manager/dashboard');
  };

  return (
    <div className="add-admin-page">
      <div className="page-header">
        <button
          onClick={handleCancel}
          className="back-button"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1>Add New Admin</h1>
      </div>

      <div className="add-admin-content">
        <div className="form-container">
          <div className="form-header">
            <UserPlus size={32} className="form-icon" />
            <h2>Create Admin Account</h2>
            <p>Fill in the details below to create a new admin account</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <X size={20} />
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <Check size={20} />
              {success}
            </div>
          )}

          <form onSubmit={handleCreateAdmin} className="admin-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={newAdmin.username}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={newAdmin.firstName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter first name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={newAdmin.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter last name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newAdmin.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={newAdmin.phoneNumber}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="password">Temporary Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newAdmin.password}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  minLength="6"
                  placeholder="Enter temporary password"
                />
                <small className="form-hint">Admin will receive login credentials via email</small>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAdminManager;
