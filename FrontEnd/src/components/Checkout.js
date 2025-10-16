import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, CheckCircle, CreditCard, Lock } from 'lucide-react';
import axios from 'axios';
import '../styles/Checkout.css';

const Checkout = ({ reservations, setReservations, currentUser }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { reservation, amenities, totalPrice, currentUser: stateCurrentUser } = state || {};

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    altPhone: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolderName: '',
    billingAddress: '',
    billingCity: '',
    billingZip: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Checkout - state received:', state);
    console.log('Checkout - reservation:', reservation);
    console.log('Checkout - currentUser (props):', currentUser);
    console.log('Checkout - currentUser (state):', stateCurrentUser);
    if (!reservation || !currentUser) {
      console.log('Checkout - Redirecting to /search: missing reservation or currentUser');
      navigate('/search');
    }
  }, [reservation, currentUser, navigate]);

  const formatDate = (date) => new Date(date).toLocaleDateString('en-FJ', { timeZone: 'Pacific/Fiji' });
  const formatDateForBackend = (date) => new Date(date).toISOString().split('T')[0];

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Personal Information
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.phone || !/^\d{7,15}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Valid phone number is required';
    
    // Credit Card Information
    if (!formData.cardNumber || formData.cardNumber.replace(/\D/g, '').length < 13) {
      newErrors.cardNumber = 'Valid card number is required (13-19 digits)';
    }
    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiry = 'Card expiry date is required';
    } else {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const inputYear = parseInt(formData.expiryYear);
      const inputMonth = parseInt(formData.expiryMonth);
      
      if (inputYear < currentYear || (inputYear === currentYear && inputMonth < currentMonth)) {
        newErrors.expiry = 'Card has expired';
      }
    }
    if (!formData.cvv || !/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'Valid CVV is required (3-4 digits)';
    }
    if (!formData.cardHolderName.trim()) newErrors.cardHolderName = 'Cardholder name is required';
    if (!formData.billingAddress.trim()) newErrors.billingAddress = 'Billing address is required';
    if (!formData.billingCity.trim()) newErrors.billingCity = 'Billing city is required';
    if (!formData.billingZip.trim()) newErrors.billingZip = 'Billing ZIP code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      value = formatCardNumber(value);
      if (value.replace(/\D/g, '').length > 19) return; // Limit to 19 digits
    }
    
    // Format phone number
    if (name === 'phone' || name === 'altPhone') {
      value = value.replace(/\D/g, ''); // Only digits
      if (value.length > 15) return; // Limit phone number length
    }
    
    // Format CVV
    if (name === 'cvv') {
      value = value.replace(/\D/g, ''); // Only digits
      if (value.length > 4) return; // Limit to 4 digits
    }
    
    // Format expiry month/year
    if (name === 'expiryMonth') {
      value = value.replace(/\D/g, ''); // Only digits
      if (parseInt(value) > 12) return; // Max 12 months
      if (value.length > 2) return; // Max 2 digits
    }
    
    if (name === 'expiryYear') {
      value = value.replace(/\D/g, ''); // Only digits
      if (value.length > 4) return; // Max 4 digits
    }
    
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setLoading(true);
    setError('');
  
    try {
      const data = {
        vehicle: { id: reservation.vehicle.id },
        userId: currentUser.id,
        rentalDate: formatDateForBackend(reservation.rentalDate),
        returnDate: formatDateForBackend(reservation.returnDate),
        status: 'Confirmed',
        amenities,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        altPhone: formData.altPhone || null,
        paymentMethod: 'Credit Card',
        lastFourDigits: formData.cardNumber.slice(-4),
        billingAddress: formData.billingAddress,
        billingCity: formData.billingCity,
        billingZip: formData.billingZip
      };
  
      console.log('Checkout - Booking request data:', data);
  
      const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
  
      const response = await fetch(`${API_BASE}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Request failed: ${response.status}`);
      }
  
      const result = await response.json();
      console.log('Checkout - Booking response:', result);
  
      setReservations(prev => [...prev, { ...result, vehicle: reservation.vehicle }]);
      alert(`Successfully booked ${reservation.vehicle.make} ${reservation.vehicle.model}!`);
      navigate('/reservations');
    } catch (err) {
      console.error('Checkout - Booking error:', err);
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  const vehicle = reservation?.vehicle;
  const days = reservation ?
    Math.floor((new Date(reservation.returnDate) - new Date(reservation.rentalDate)) / (1000 * 60 * 60 * 24)) + 1
    : 1;
  const basePrice = vehicle ? days * vehicle.pricePerDay : 0;
  const availableAmenities = [
    { id: 'none', name: 'None', price: 0 },
    { id: 'baby-sitter', name: 'Baby Sitter', price: 20 },
    { id: 'gps', name: 'GPS Navigation', price: 10 },
    { id: 'power-bank', name: 'Power Bank', price: 5 }
  ];

  if (!reservation || !vehicle) return <div className="loading">Loading...</div>;

  return (
    <div className="car-detail-container">
      <header className="detail-header">
        <h1><Lock size={20} /> Secure Checkout</h1>
        <p>Enter your details and payment information to complete the booking</p>
      </header>
      <div className="detail-content">
        <div className="detail-main">
          <form onSubmit={handleSubmit}>
            {/* Customer Information Section */}
            <div className="form-section">
              <h2>Customer Information</h2>
              {error && (
                <div className="error">
                  <p>{error}</p>
                  <button type="button" onClick={() => setError('')}>Clear</button>
                </div>
              )}
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={errors.fullName ? 'input-error' : ''}
                  />
                  {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={errors.email ? 'input-error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="phone">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="679XXXXXXX"
                    className={errors.phone ? 'input-error' : ''}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
                <div className="form-group half">
                  <label htmlFor="altPhone">Alternative Phone</label>
                  <input
                    type="tel"
                    name="altPhone"
                    value={formData.altPhone}
                    onChange={handleChange}
                    placeholder="679XXXXXXX (Optional)"
                  />
                </div>
              </div>
            </div>

            {/* Payment Information Section */}
            <div className="form-section">
              <h2><CreditCard size={20} /> Payment Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    className={errors.cardNumber ? 'input-error' : ''}
                  />
                  {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group third">
                  <label htmlFor="expiryMonth">Expiry Month *</label>
                  <select
                    name="expiryMonth"
                    value={formData.expiryMonth}
                    onChange={handleChange}
                    className={errors.expiry ? 'input-error' : ''}
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group third">
                  <label htmlFor="expiryYear">Expiry Year *</label>
                  <select
                    name="expiryYear"
                    value={formData.expiryYear}
                    onChange={handleChange}
                    className={errors.expiry ? 'input-error' : ''}
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group third">
                  <label htmlFor="cvv">CVV *</label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    className={errors.cvv ? 'input-error' : ''}
                  />
                  {errors.cvv && <span className="error-text">{errors.cvv}</span>}
                </div>
              </div>
              {errors.expiry && <span className="error-text">{errors.expiry}</span>}
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cardHolderName">Cardholder Name *</label>
                  <input
                    type="text"
                    name="cardHolderName"
                    value={formData.cardHolderName}
                    onChange={handleChange}
                    placeholder="Name as it appears on card"
                    className={errors.cardHolderName ? 'input-error' : ''}
                  />
                  {errors.cardHolderName && <span className="error-text">{errors.cardHolderName}</span>}
                </div>
              </div>
            </div>

            {/* Billing Information Section */}
            <div className="form-section">
              <h2>Billing Address</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="billingAddress">Street Address *</label>
                  <input
                    type="text"
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                    className={errors.billingAddress ? 'input-error' : ''}
                  />
                  {errors.billingAddress && <span className="error-text">{errors.billingAddress}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="billingCity">City *</label>
                  <input
                    type="text"
                    name="billingCity"
                    value={formData.billingCity}
                    onChange={handleChange}
                    placeholder="Suva"
                    className={errors.billingCity ? 'input-error' : ''}
                  />
                  {errors.billingCity && <span className="error-text">{errors.billingCity}</span>}
                </div>
                <div className="form-group half">
                  <label htmlFor="billingZip">Postal Code *</label>
                  <input
                    type="text"
                    name="billingZip"
                    value={formData.billingZip}
                    onChange={handleChange}
                    placeholder="12345"
                    className={errors.billingZip ? 'input-error' : ''}
                  />
                  {errors.billingZip && <span className="error-text">{errors.billingZip}</span>}
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="detail-sidebar">
          <h2>Booking Summary</h2>
          <div className="summary-section">
            <h4>{vehicle.make} {vehicle.model} ({vehicle.year})</h4>
            <p><strong>Type:</strong> {vehicle.vehicleType}</p>
            <p><strong>Location:</strong> {vehicle.location}</p>
            <div className="pickup-dropoff">
              <div className="pickup">
                <h4>Pick-up</h4>
                <p><CalendarDays size={16} /> {formatDate(reservation.rentalDate)}</p>
                <p><MapPin size={16} /> {vehicle.location}</p>
              </div>
              <div className="dropoff">
                <h4>Drop-off</h4>
                <p><CalendarDays size={16} /> {formatDate(reservation.returnDate)}</p>
              </div>
            </div>
            <div className="amenities">
              <h4>Amenities</h4>
              <p>
                {amenities.length > 0 && !amenities.includes('none')
                  ? amenities.map(id => availableAmenities.find(a => a.id === id).name).join(', ')
                  : 'None'}
              </p>
            </div>
            <div className="pricing">
              <p>Base Price ({days} day{days > 1 ? 's' : ''}): <span>{basePrice.toFixed(2)} FJD</span></p>
              {amenities.length > 0 && !amenities.includes('none') && (
                <p>Amenities: <span>+{(totalPrice - basePrice).toFixed(2)} FJD</span></p>
              )}
              <hr />
              <p><strong>Total: <span>{totalPrice.toFixed(2)} FJD</span></strong></p>
            </div>
            <div className="security-info">
              <p><Lock size={14} /> Your payment information is secure</p>
            </div>
            <button
              onClick={handleSubmit}
              className="btn primary"
              disabled={loading}
            >
              <CheckCircle size={18} /> {loading ? 'Processing Payment...' : `Pay ${totalPrice.toFixed(2)} FJD`}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)} // Go back to previous page
              className="btn secondary"
            >
              Back to Previous
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;