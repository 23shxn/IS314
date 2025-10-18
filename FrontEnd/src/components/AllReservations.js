import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Car, MapPin, Clock, CheckCircle, X, Eye, Search, Filter, Layout, Users, ClipboardList, ToolCase, LogOut } from 'lucide-react';
import '../styles/AllReservations.css';

const AllReservations = ({ reservations, setReservations, currentUser, setCurrentUser, role, cars }) => {
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (!reservations || reservations.length === 0) {
      fetchAllReservations();
    }
  }, []);

  const fetchAllReservations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reservations/all`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch reservations');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reservations/${reservationId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        // Update local state
        setReservations(prev => prev.map(res =>
          res.id === reservationId ? { ...res, status: 'Cancelled' } : res
        ));
        alert('Reservation cancelled successfully');
      } else {
        alert('Failed to cancel reservation');
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Error cancelling reservation');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return '#27ae60';
      case 'completed': return '#2980b9';
      case 'cancelled': return '#e74c3c';
      case 'ready for pickup': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = searchTerm === '' ||
      reservation.vehicle?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.id.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || reservation.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="all-reservations">
        <div className="loading">Loading reservations...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Ronaldo's Rentals {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'} Dashboard</h2>
        </div>
        <div className="sidebar-menu">
          <button
            onClick={() => navigate(role === 'SUPER_ADMIN' ? '/manager/dashboard' : '/admin/dashboard')}
            className="sidebar-btn"
          >
            <Layout className="btn-icon" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => navigate(role === 'SUPER_ADMIN' ? '/manager/vehicles' : '/admin/vehicles')}
            className="sidebar-btn"
          >
            <Car className="btn-icon" />
            <span>Vehicle Management</span>
          </button>
          <button
            onClick={() => navigate(role === 'SUPER_ADMIN' ? '/manager/users' : '/admin/users')}
            className="sidebar-btn"
          >
            <Users className="btn-icon" />
            <span>User Management</span>
          </button>
          <button
            onClick={() => navigate(role === 'SUPER_ADMIN' ? '/manager/pending-requests' : '/admin/pending-requests')}
            className="sidebar-btn"
          >
            <ClipboardList className="btn-icon" />
            <span>Pending Requests</span>
          </button>
          <button
            onClick={() => navigate(role === 'SUPER_ADMIN' ? '/manager/maintenance' : '/admin/maintenance')}
            className="sidebar-btn"
          >
            <ToolCase className="btn-icon" />
            <span>Maintenance</span>
          </button>
          <button
            onClick={() => navigate(role === 'SUPER_ADMIN' ? '/manager/reservations' : '/admin/reservations')}
            className={`sidebar-btn active`}
          >
            <Calendar className="btn-icon" />
            <span>Reservations</span>
          </button>
        </div>
        <div className="sidebar-footer">
          <button onClick={() => {
            setCurrentUser(null);
            navigate('/login');
          }} className="sidebar-btn logout">
            <LogOut className="btn-icon" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="main-content">
        <div className="all-reservations">
          <div className="reservations-header">
            <h2>All Reservations</h2>
            <p>View and manage all vehicle reservations</p>
          </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by reservation ID, vehicle, or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="status-filter">
          <Filter size={20} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="ready for pickup">Ready for Pickup</option>
          </select>
        </div>
      </div>

      {/* All Reservations Table */}
      {filteredReservations.length === 0 ? (
        <div className="no-reservations">
          <Calendar size={48} style={{ color: '#bdc3c7', marginBottom: '1rem' }} />
          <h3>No Reservations Found</h3>
          <p>No reservations match your current filters.</p>
        </div>
      ) : (
        <div className="reservations-table-container">
          <table className="reservations-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle</th>
                <th>Customer</th>
                <th>Booking Dates</th>
                <th>Status</th>
                <th>Location</th>
                <th>Total Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map(reservation => (
                <tr key={reservation.id}>
                  <td>#{reservation.id}</td>
                  <td>
                    {reservation.vehicle?.make} {reservation.vehicle?.model}
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                      {reservation.vehicle?.year} • {reservation.vehicle?.vehicleType}
                    </div>
                  </td>
                  <td>
                    {reservation.firstName || reservation.lastName
                      ? `${reservation.title || ''} ${reservation.firstName || ''} ${reservation.lastName || ''}`.trim()
                      : 'N/A'}
                  </td>
                  <td>
                    <div>
                      <div>
                        {reservation.pickupDate
                          ? new Date(reservation.pickupDate).toLocaleDateString()
                          : new Date(reservation.rentalDate).toLocaleDateString()
                        }
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        to {reservation.dropoffDate
                          ? new Date(reservation.dropoffDate).toLocaleDateString()
                          : new Date(reservation.returnDate).toLocaleDateString()
                        }
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusColor(reservation.status) + '20',
                        color: getStatusColor(reservation.status)
                      }}
                    >
                      {reservation.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <MapPin size={12} style={{ marginRight: '4px' }} />
                      {reservation.vehicle?.location}
                    </div>
                  </td>
                  <td>
                    ${reservation.totalPrice?.toFixed(2)} FJD
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => setSelectedReservation(reservation)}
                        className="action-btn view-btn"
                        title="View Reservation Details"
                      >
                        <Eye size={16} />
                      </button>
                      {reservation.status.toLowerCase() === 'confirmed' && (
                        <button
                          onClick={() => cancelReservation(reservation.id)}
                          className="action-btn cancel-btn"
                          title="Cancel Reservation"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Reservation Details</h3>
              <button
                onClick={() => setSelectedReservation(null)}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="reservation-info">
                <div className="info-section">
                  <h4>Vehicle Information</h4>
                  <div className="vehicle-card">
                    <Car size={24} />
                    <div>
                      <h5>{selectedReservation.vehicle?.make} {selectedReservation.vehicle?.model}</h5>
                      <p><MapPin size={16} /> {selectedReservation.vehicle?.location}</p>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h4>Reservation Details</h4>
                  <div className="details-grid">
                    <div>
                      <label>Reservation ID</label>
                      <span>#{selectedReservation.id}</span>
                    </div>
                    <div>
                      <label>Status</label>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(selectedReservation.status) + '20',
                          color: getStatusColor(selectedReservation.status)
                        }}
                      >
                        {selectedReservation.status}
                      </span>
                    </div>
                    <div>
                      <label>Customer</label>
                      <span>
                        {selectedReservation.title} {selectedReservation.firstName} {selectedReservation.lastName}
                      </span>
                    </div>
                    <div>
                      <label>Pickup Date</label>
                      <span>
                        {selectedReservation.pickupDate
                          ? new Date(selectedReservation.pickupDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : new Date(selectedReservation.rentalDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                        }
                      </span>
                    </div>
                    <div>
                      <label>Drop-off Date</label>
                      <span>
                        {selectedReservation.dropoffDate
                          ? new Date(selectedReservation.dropoffDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : new Date(selectedReservation.returnDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                        }
                      </span>
                    </div>
                    <div>
                      <label>Total Price</label>
                      <span>${selectedReservation.totalPrice?.toFixed(2)} FJD</span>
                    </div>
                    <div>
                      <label>Reserved On</label>
                      <span>
                        {new Date(selectedReservation.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedReservation.additionalRequests && (
                  <div className="info-section">
                    <h4>Additional Requests</h4>
                    <p>{selectedReservation.additionalRequests}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setSelectedReservation(null)}
                className="btn-secondary"
              >
                Close
              </button>
              {selectedReservation.status.toLowerCase() === 'confirmed' && (
                <button
                  onClick={() => {
                    cancelReservation(selectedReservation.id);
                    setSelectedReservation(null);
                  }}
                  className="btn-danger"
                >
                  Cancel Reservation
                </button>
              )}
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default AllReservations;
