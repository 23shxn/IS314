import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Car, MapPin, Clock, CheckCircle, X, Eye } from 'lucide-react';
import axios from 'axios';

const ReservationManagement = ({ reservations, setReservations, currentUser }) => {
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const cancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:8080/api/reservations/${reservationId}/cancel`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
      
      // Update local state to reflect cancellation
      setReservations(prev => prev.map(reservation => 
        reservation.id === reservationId 
          ? { ...reservation, status: 'Cancelled' }
          : reservation
      ));
      
      alert('Reservation cancelled successfully!');
      
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Failed to cancel reservation. Please try again.');
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

  const userReservations = reservations.filter(res => 
    currentUser && res.userId === currentUser.id
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>My Reservations</h2>
        <p style={{ color: '#666' }}>Manage your vehicle reservations</p>
      </div>

      {userReservations.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Calendar size={48} style={{ color: '#bdc3c7', marginBottom: '1rem' }} />
          <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>No Reservations</h3>
          <p style={{ color: '#95a5a6', marginBottom: '1.5rem' }}>
            You haven't made any reservations yet.
          </p>
          <button 
            onClick={() => navigate('/search')}
            className="btn-primary"
          >
            Browse Vehicles
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {userReservations.map(reservation => (
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
                {/* Vehicle Info */}
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

                {/* Reservation Details */}
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
                        {reservation.pickupDate 
                          ? new Date(reservation.pickupDate).toLocaleDateString()
                          : new Date(reservation.rentalDate).toLocaleDateString()
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

                {/* Actions */}
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
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reservation Detail Modal */}
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

                {selectedReservation.pickupDate && (
                  <div>
                    <label style={{ fontWeight: '500', color: '#555', display: 'block', marginBottom: '0.25rem' }}>
                      Pickup Date & Time
                    </label>
                    <span style={{ color: '#666' }}>
                      {new Date(selectedReservation.pickupDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {selectedReservation.pickupTime || '10:00'}
                    </span>
                  </div>
                )}

                {selectedReservation.dropoffDate && (
                  <div>
                    <label style={{ fontWeight: '500', color: '#555', display: 'block', marginBottom: '0.25rem' }}>
                      Drop-off Date & Time
                    </label>
                    <span style={{ color: '#666' }}>
                      {new Date(selectedReservation.dropoffDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {selectedReservation.dropoffTime || '10:00'}
                    </span>
                  </div>
                )}

                {!selectedReservation.pickupDate && selectedReservation.rentalDate && (
                  <div>
                    <label style={{ fontWeight: '500', color: '#555', display: 'block', marginBottom: '0.25rem' }}>
                      Rental Date
                    </label>
                    <span style={{ color: '#666' }}>
                      {new Date(selectedReservation.rentalDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                {selectedReservation.totalDays && (
                  <div>
                    <label style={{ fontWeight: '500', color: '#555', display: 'block', marginBottom: '0.25rem' }}>
                      Duration
                    </label>
                    <span style={{ color: '#666' }}>
                      {selectedReservation.totalDays} day{selectedReservation.totalDays !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {selectedReservation.totalPrice && (
                  <div>
                    <label style={{ fontWeight: '500', color: '#555', display: 'block', marginBottom: '0.25rem' }}>
                      Total Price
                    </label>
                    <span style={{ color: '#666', fontSize: '1.1rem', fontWeight: '500' }}>
                      ${selectedReservation.totalPrice.toFixed(2)} FJD
                    </span>
                    {selectedReservation.basePrice && (
                      <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.25rem' }}>
                        Base: ${selectedReservation.basePrice.toFixed(2)} + Tax: ${(selectedReservation.tax || 0).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                {(selectedReservation.firstName || selectedReservation.lastName) && (
                  <div>
                    <label style={{ fontWeight: '500', color: '#555', display: 'block', marginBottom: '0.25rem' }}>
                      Driver
                    </label>
                    <span style={{ color: '#666' }}>
                      {selectedReservation.title} {selectedReservation.firstName} {selectedReservation.lastName}
                    </span>
                  </div>
                )}

                {selectedReservation.additionalRequests && (
                  <div>
                    <label style={{ fontWeight: '500', color: '#555', display: 'block', marginBottom: '0.25rem' }}>
                      Additional Requests
                    </label>
                    <span style={{ color: '#666' }}>
                      {selectedReservation.additionalRequests}
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

      <style jsx>{`
        .btn-primary {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }
        
        .btn-primary:hover {
          background-color: #2980b9;
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


export default ReservationManagement;