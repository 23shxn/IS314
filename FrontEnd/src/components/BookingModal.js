import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Car, 
  Users, 
  Fuel, 
  Settings,
  CreditCard,
  CheckCircle,
  Phone,
  Mail
} from 'lucide-react';
import '../styles/BookingModal.css';
import PropTypes from 'prop-types';

const BookingModal = ({ vehicle, isOpen, onClose, onConfirm, searchParams, currentUser }) => {
  const [bookingDetails, setBookingDetails] = useState({
    title: '',
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    dateOfBirth: '',
    licenseNumber: '',
    pickupDate: searchParams?.startDate || '',
    dropoffDate: '',
    pickupTime: '10:00',
    dropoffTime: '10:00',
    pickupLocation: vehicle?.location || '',
    dropoffLocation: vehicle?.location || '',
    additionalRequests: '',
    acceptTerms: false
  });

  const [errors, setErrors] = useState({});

  if (!isOpen || !vehicle) return null;

  const calculateDays = () => {
    if (!bookingDetails.pickupDate || !bookingDetails.dropoffDate) return 1;
    const pickup = new Date(bookingDetails.pickupDate);
    const dropoff = new Date(bookingDetails.dropoffDate);
    const diffTime = Math.abs(dropoff - pickup);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const totalDays = calculateDays();
  const basePrice = (vehicle.pricePerDay || 0) * totalDays;
  const taxRate = 0.15; // 15% tax
  const tax = basePrice * taxRate;
  const totalPrice = basePrice + tax;

  const validateForm = () => {
    const newErrors = {};

    if (!bookingDetails.title) newErrors.title = 'Title is required';
    if (!bookingDetails.firstName) newErrors.firstName = 'First name is required';
    if (!bookingDetails.lastName) newErrors.lastName = 'Last name is required';
    if (!bookingDetails.email) newErrors.email = 'Email is required';
    if (!bookingDetails.phone) newErrors.phone = 'Phone number is required';
    if (!bookingDetails.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!bookingDetails.licenseNumber) newErrors.licenseNumber = 'License number is required';
    if (!bookingDetails.pickupDate) newErrors.pickupDate = 'Pickup date is required';
    if (!bookingDetails.dropoffDate) newErrors.dropoffDate = 'Drop-off date is required';
    if (!bookingDetails.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions';

    // Validate dates
    if (bookingDetails.pickupDate && bookingDetails.dropoffDate) {
      const pickup = new Date(bookingDetails.pickupDate);
      const dropoff = new Date(bookingDetails.dropoffDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (pickup < today) {
        newErrors.pickupDate = 'Pickup date cannot be in the past';
      }
      
      if (dropoff <= pickup) {
        newErrors.dropoffDate = 'Drop-off date must be after pickup date';
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (bookingDetails.email && !emailRegex.test(bookingDetails.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone (basic validation)
    if (bookingDetails.phone && bookingDetails.phone.length < 7) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Validate date of birth (must be at least 18 years old)
    if (bookingDetails.dateOfBirth) {
      const birthDate = new Date(bookingDetails.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old to rent a vehicle';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const reservation = {
      id: Date.now(),
      vehicleId: vehicle.id,
      userId: currentUser.id,
      vehicle,
      ...bookingDetails,
      totalDays,
      basePrice,
      tax,
      totalPrice,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    onConfirm(reservation);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setBookingDetails(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="booking-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete your booking</h2>
          <button onClick={onClose} className="close-btn" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>

        <div className="booking-modal-body">
          <div className="booking-content-grid">
            {/* Vehicle Details Section */}
            <div className="vehicle-summary">
              <div className="vehicle-summary-header">
                <h3>{vehicle.make} {vehicle.model} {vehicle.year}</h3>
                <div className="vehicle-badges">
                  <span className="vehicle-type-badge">{vehicle.vehicleType}</span>
                  <span className="vehicle-category">{vehicle.seatingCapacity} seats</span>
                </div>
              </div>

              <div className="vehicle-image-section">
                {vehicle.vehicleImage1 ? (
                  <img
                    src={`data:image/jpeg;base64,${vehicle.vehicleImage1}`}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="booking-vehicle-image"
                  />
                ) : (
                  <div className="booking-placeholder-image">
                    <Car size={48} />
                  </div>
                )}
              </div>

              <div className="vehicle-features">
                <div className="feature-row">
                  <div className="feature-item">
                    <Users size={16} />
                    <span>{vehicle.seatingCapacity} seats</span>
                  </div>
                  <div className="feature-item">
                    <Car size={16} />
                    <span>{vehicle.transmission}</span>
                  </div>
                  <div className="feature-item">
                    <Fuel size={16} />
                    <span>{vehicle.fuelType}</span>
                  </div>
                  <div className="feature-item">
                    <Settings size={16} />
                    <span>A/C</span>
                  </div>
                </div>
              </div>

              <div className="rate-includes">
                <h4>Rate includes:</h4>
                <ul>
                  <li><CheckCircle size={14} /> Loss damage waiver</li>
                  <li><CheckCircle size={14} /> General surcharge</li>
                  <li><CheckCircle size={14} /> Basic insurance</li>
                </ul>
              </div>
            </div>

            {/* Booking Details Section */}
            <div className="booking-details-section">
              <div className="pickup-dropoff-info">
                <div className="location-info">
                  <div className="location-item">
                    <MapPin size={16} className="location-icon pickup" />
                    <div>
                      <strong>Pick-up:</strong>
                      <p>{vehicle.location}</p>
                      <p className="location-details">Rental counter and shuttle to vehicle</p>
                    </div>
                  </div>
                  <div className="date-time">
                    <Calendar size={16} />
                    <span>{bookingDetails.pickupDate ? new Date(bookingDetails.pickupDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Select date'} {bookingDetails.pickupTime}</span>
                  </div>
                </div>

                <div className="location-info">
                  <div className="location-item">
                    <MapPin size={16} className="location-icon dropoff" />
                    <div>
                      <strong>Drop-off:</strong>
                      <p>{vehicle.location}</p>
                      <p className="location-details">Rental counter and shuttle to vehicle</p>
                    </div>
                  </div>
                  <div className="date-time">
                    <Calendar size={16} />
                    <span>{bookingDetails.dropoffDate ? new Date(bookingDetails.dropoffDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Select date'} {bookingDetails.dropoffTime}</span>
                  </div>
                </div>
              </div>

              <button className="modify-reservation-btn" type="button">
                Modify reservation
              </button>

              <div className="pricing-section">
                <div className="pricing-row">
                  <span>Base rate ({totalDays} day{totalDays !== 1 ? 's' : ''}):</span>
                  <span>${basePrice.toFixed(2)} FJD</span>
                </div>
                <div className="pricing-row">
                  <span>Taxes & fees:</span>
                  <span>${tax.toFixed(2)} FJD</span>
                </div>
                <div className="pricing-row total">
                  <strong>Total price:</strong>
                  <strong>${totalPrice.toFixed(2)} FJD</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Details Form */}
          <form onSubmit={handleSubmit} className="driver-details-form">
            <h3>Driver details</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <select
                  id="title"
                  value={bookingDetails.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={errors.title ? 'error' : ''}
                >
                  <option value="">Select title</option>
                  <option value="Mr">Mr</option>
                  <option value="Ms">Ms</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Dr">Dr</option>
                </select>
                {errors.title && <span className="error-message">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="firstName">First name *</label>
                <input
                  type="text"
                  id="firstName"
                  value={bookingDetails.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last name *</label>
                <input
                  type="text"
                  id="lastName"
                  value={bookingDetails.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email address *</label>
                <input
                  type="email"
                  id="email"
                  value={bookingDetails.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter your email"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone number *</label>
                <input
                  type="tel"
                  id="phone"
                  value={bookingDetails.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'error' : ''}
                  placeholder="Enter your phone number"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of birth *</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={bookingDetails.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={errors.dateOfBirth ? 'error' : ''}
                  max={new Date(Date.now() - 567648000000).toISOString().split('T')[0]} // 18 years ago
                />
                {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="licenseNumber">Driving license number *</label>
                <input
                  type="text"
                  id="licenseNumber"
                  value={bookingDetails.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  className={errors.licenseNumber ? 'error' : ''}
                  placeholder="Enter your license number"
                />
                {errors.licenseNumber && <span className="error-message">{errors.licenseNumber}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="pickupDate">Pickup date *</label>
                <input
                  type="date"
                  id="pickupDate"
                  value={bookingDetails.pickupDate}
                  onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                  className={errors.pickupDate ? 'error' : ''}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.pickupDate && <span className="error-message">{errors.pickupDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="dropoffDate">Drop-off date *</label>
                <input
                  type="date"
                  id="dropoffDate"
                  value={bookingDetails.dropoffDate}
                  onChange={(e) => handleInputChange('dropoffDate', e.target.value)}
                  className={errors.dropoffDate ? 'error' : ''}
                  min={bookingDetails.pickupDate || new Date().toISOString().split('T')[0]}
                />
                {errors.dropoffDate && <span className="error-message">{errors.dropoffDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="pickupTime">Pickup time</label>
                <input
                  type="time"
                  id="pickupTime"
                  value={bookingDetails.pickupTime}
                  onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dropoffTime">Drop-off time</label>
                <input
                  type="time"
                  id="dropoffTime"
                  value={bookingDetails.dropoffTime}
                  onChange={(e) => handleInputChange('dropoffTime', e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="additionalRequests">Additional requests</label>
                <textarea
                  id="additionalRequests"
                  value={bookingDetails.additionalRequests}
                  onChange={(e) => handleInputChange('additionalRequests', e.target.value)}
                  placeholder="Any special requests or requirements..."
                  rows="3"
                />
              </div>
            </div>

            <div className="terms-section">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={bookingDetails.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                  className={errors.acceptTerms ? 'error' : ''}
                />
                <span className="checkmark"></span>
                I accept the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
              </label>
              {errors.acceptTerms && <span className="error-message">{errors.acceptTerms}</span>}
            </div>

            <div className="booking-actions">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary booking-confirm-btn">
                <CreditCard size={16} />
                Complete Booking - ${totalPrice.toFixed(2)} FJD
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

BookingModal.propTypes = {
  vehicle: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    make: PropTypes.string,
    model: PropTypes.string,
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    vehicleType: PropTypes.string,
    seatingCapacity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    transmission: PropTypes.string,
    fuelType: PropTypes.string,
    pricePerDay: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    location: PropTypes.string,
    vehicleImage1: PropTypes.string,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  searchParams: PropTypes.shape({
    startDate: PropTypes.string,
  }),
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
  }),
};

export default BookingModal;