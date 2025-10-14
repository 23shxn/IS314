import React, { useState, useEffect } from 'react';
import { Calendar, Car, MapPin, Clock, CheckCircle, X, Eye, Bell, BellOff } from 'lucide-react';
import axios from 'axios';

const AdminReservations = ({ currentUser }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [lastReservationCount, setLastReservationCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    fetchReservations();
    
    const interval = setInterval(fetchReservations, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    
    if (notificationsEnabled && reservations.length > lastReservationCount && lastReservationCount > 0) {
      const newReservations = reservations.length - lastReservationCount;
      setNotificationMessage(`New reservation${newReservations > 1 ? 's' : ''} received!`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }
    setLastReservationCount(reservations.length);
  }, [reservations, lastReservationCount, notificationsEnabled]);

  const fetchReservations = async () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http:
    try {
      const response = await axios.get(`${apiUrl}/api/reservations/admin/all`, {
        withCredentials: true
      });
      setReservations(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
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

  const updateReservationStatus = async (reservationId, newStatus) => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http:
    try {
      await axios.put(`${apiUrl}/api/reservations/${reservationId}/status`, {
        status: newStatus
      }, {
        withCredentials: true
      });
      fetchReservations(); 
    } catch (err) {
      console.error('Error updating reservation status:', err);
      setError('Failed to update reservation status');
    }
  };

  const cancelReservation = async (reservationId) => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http:
    try {
      await axios.put(`${apiUrl}/api/reservations/${reservationId}/cancel`, {}, {
        withCredentials: true
      });
      fetchReservations(); 
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      setError('Failed to cancel reservation');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div>Loading reservations...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      {}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>All Reservations</h2>
          <p style={{ color: '#666' }}>Manage all vehicle reservations</p>
        </div>
        <button
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #3498db',
            backgroundColor: notificationsEnabled ? '#3498db' : 'white',
            color: notificationsEnabled ? 'white' : '#3498db',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
          {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
        </button>
      </div>

      {}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#27ae60',
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <Bell size={20} style={{ marginRight: '0.5rem' }} />
          {notificationMessage}
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {reservations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Calendar size={48} style={{ color: '#bdc3c7', marginBottom: '1rem' }} />
          <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>No Reservations</h3>
          <p style={{ color: '#95a5a6' }}>No reservations have been made yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {reservations.map(reservation => (
            <div
              key={reservation.id}
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `2px solid ${getStatusColor(reservation.status)}20`
              }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: '1.5rem',
                alignItems: 'center'
              }}>
                {}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Car size={24} color="#666" />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#2c3e50' }}>
                      {reservation.vehicle?.make} {reservation.vehicle?.model}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                      <MapPin size={14} />
                      <span>{reservation.vehicle?.location}</span>
                    </div>
                  </div>
                </div>

                {}
                <div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      backgroundColor: getStatusColor(reservation.status) + '20',
                      color: getStatusColor(reservation.status)
                    }}>
                      {reservation.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} />
                      <span>
                        {reservation.rentalDate
                          ? new Date(reservation.rentalDate).toLocaleDateString()
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={14} />
                      <span>
                        Reserved on {new Date(reservation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {reservation.totalPrice && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontWeight: '500' }}>
                          ${reservation.totalPrice.toFixed(2)} FJD
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setSelectedReservation(reservation)}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #3498db',
                      backgroundColor: 'white',
                      color: '#3498db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>

                  {reservation.status.toLowerCase() === 'confirmed' && (
                    <>
                      <button
                        onClick={() => updateReservationStatus(reservation.id, 'Ready for Pickup')}
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #f39c12',
                          backgroundColor: 'white',
                          color: '#f39c12',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Mark as Ready for Pickup"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => cancelReservation(reservation.id)}
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #e74c3c',
                          backgroundColor: 'white',
                          color: '#e74c3c',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Cancel Reservation"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {}
      {selectedReservation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>Reservation Details</h3>
              <button
                onClick={() => setSelectedReservation(null)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>
                  {selectedReservation.vehicle?.make} {selectedReservation.vehicle?.model}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666' }}>
                  <MapPin size={16} />
                  <span>{selectedReservation.vehicle?.location}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ fontWeight: '500', color: '#555', display: 'block', marginBottom: '0.25rem' }}>
                    Reservation ID
                  </label>
                  <span style={{ color: '#666' }}>#{selectedReservation.id}</span>
                </div>

                <div>
                  <label style={{ fontWeight: '500', color: '#555', display: 'block', marginBottom: '0.25rem' }}>
                    User ID
                  </label>
                  <span style={{ color: '#666' }}>#{selectedReservation.userId}</span>
                </div>

                <div>
                  <label style={{ fontWeight: '500', color: '#555', display: 'block', marginBottom: '0.25rem' }}>
                    Status
                  </label>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    backgroundColor: getStatusColor(selectedReservation.status) + '20',
                    color: getStatusColor(selectedReservation.status)
                  }}>
                    {selectedReservation.status}
                  </span>
                </div>

                <div>
                  <label style={{ fontWeight: '500', color: '#555', display: 'block', marginBottom: '0.25rem' }}>
                    Rental Date
                  </label>
                  <span style={{ color: '#666' }}>
                    {selectedReservation.rentalDate
                      ? new Date(selectedReservation.rentalDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'
                    }
                  </span>
                </div>

                <div>
                  <label style={{ fontWeight: '500', color: '#555', display: 'block', marginBottom: '0.25rem' }}>
                    Return Date
                  </label>
                  <span style={{ color: '#666' }}>
                    {selectedReservation.returnDate
                      ? new Date(selectedReservation.returnDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'
                    }
                  </span>
                </div>

                {selectedReservation.totalPrice && (
                  <div>
                    <label style={{ fontWeight: '500', color: '#555', display: 'block', marginBottom: '0.25rem' }}>
                      Total Price
                    </label>
                    <span style={{ color: '#666', fontSize: '1.1rem', fontWeight: '500' }}>
                      ${selectedReservation.totalPrice.toFixed(2)} FJD
                    </span>
                  </div>
                )}

                <div>
                  <label style={{ fontWeight: '500', color: '#555', display: 'block', marginBottom: '0.25rem' }}>
                    Reserved On
                  </label>
                  <span style={{ color: '#666' }}>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setSelectedReservation(null)}
                className="btn-secondary"
              >
                Close
              </button>

              {selectedReservation.status.toLowerCase() === 'confirmed' && (
                <>
                  <button
                    onClick={() => {
                      updateReservationStatus(selectedReservation.id, 'Ready for Pickup');
                      setSelectedReservation(null);
                    }}
                    className="btn-warning"
                  >
                    Mark Ready
                  </button>
                  <button
                    onClick={() => {
                      cancelReservation(selectedReservation.id);
                      setSelectedReservation(null);
                    }}
                    className="btn-danger"
                  >
                    Cancel Reservation
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .btn-secondary {
          background-color: #95a5a6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .btn-secondary:hover {
          background-color: #7f8c8d;
        }

        .btn-warning {
          background-color: #f39c12;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .btn-warning:hover {
          background-color: #e67e22;
        }

        .btn-danger {
          background-color: #e74c3c;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .btn-danger:hover {
          background-color: #c0392b;
        }
      `}</style>
    </div>
  );
};

export default AdminReservations;
