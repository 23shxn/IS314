import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Car, MapPin, CheckCircle } from 'lucide-react';
import '../styles/CompleteBooking.css';

const CompleteBooking = ({ reservations, setReservations, currentUser }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(state?.reservation || null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  useEffect(() => {
    if (!reservation) {
      navigate('/search');
    }
  }, [reservation, navigate]);

  const handleConfirmBooking = () => {
    if (reservation) {
      const confirmedReservation = {
        ...reservation,
        status: 'Confirmed',
        amenities: selectedAmenities,
      };
      setReservations(prev => [...prev, confirmedReservation]);
      alert(`Booking confirmed for ${reservation.vehicle.make} ${reservation.vehicle.model} from ${reservation.rentalDate} to ${reservation.returnDate} with ${selectedAmenities.join(', ')}`);
      navigate('/reservations');
    }
  };

  const handleAmenityChange = (e) => {
    const options = Array.from(e.target.selectedOptions);
    const selectedValues = options.map(option => option.value);
    setSelectedAmenities(selectedValues);
  };

  if (!reservation) {
    return <div className="loading">Loading...</div>;
  }

  const { vehicle, rentalDate, returnDate } = reservation;
  const totalDays = Math.ceil((new Date(returnDate) - new Date(rentalDate)) / (1000 * 60 * 60 * 24));
  const basePrice = totalDays * vehicle.pricePerDay;


  const amenityPrices = {
    'baby-sitter': 35,
    'gps': 25,
    'power-bank': 15,
    'none': 0,
  };


  const amenityCost = selectedAmenities.reduce((total, amenity) => total + (amenityPrices[amenity] || 0), 0);
  const totalPrice = basePrice + amenityCost;

  const currentDate = new Date().toLocaleString('en-FJ', { timeZone: 'Pacific/Fiji', dateStyle: 'full', timeStyle: 'short' });

  return (
    <div className="complete-booking-container">
      <header className="booking-header">
        <h1>Confirm Your Booking</h1>
        <p>Review your selection and complete your reservation</p>
        <p className="booking-date">Booking Date: {currentDate}</p>
      </header>

      <div className="booking-summary">
        <div className="vehicle-image">
          {vehicle.vehicleImage ? (
            <img 
               src={`data:image/jpeg;base64,${vehicle.vehicleImage}`} 
              alt={`${vehicle.make} ${vehicle.model}`}
            />
          ) : (
            <div className="placeholder-image">
              <Car size={60} />
            </div>
          )}
        </div>

        <div className="summary-details">
          <h2>{vehicle.make} {vehicle.model} ({vehicle.year})</h2>
          <div className="detail-item">
            <MapPin size={18} /> <span>Location: {vehicle.location}</span>
          </div>
          <div className="detail-item">
            <Car size={18} /> <span>Type: {vehicle.vehicleType}</span>
          </div>
          <div className="detail-item">
            <span>Pickup: {new Date(rentalDate).toLocaleDateString('en-FJ', { timeZone: 'Pacific/Fiji' })}</span>
          </div>
          <div className="detail-item">
            <span>Return: {new Date(returnDate).toLocaleDateString('en-FJ', { timeZone: 'Pacific/Fiji' })}</span>
          </div>
          <div className="detail-item">
            <span>Total Days: {totalDays}</span>
          </div>
          <div className="detail-item price">
            <span>Base Price per Day: ${vehicle.pricePerDay}</span>
          </div>
          
          <div className="detail-item amenities">
            <label>Add Amenities:</label>
            <select
              multiple
              value={selectedAmenities}
              onChange={handleAmenityChange}
              className="amenities-select"
            >
              <option value="">Select Amenities</option>
              <option value="baby-sitter">Baby Sitter (+$20)</option>
              <option value="gps">GPS (+$10)</option>
              <option value="power-bank">Power Bank (+$5)</option>
              <option value="none">None (+$0)</option>

            </select>
            {selectedAmenities.length > 0 && (
              <p>Selected: {selectedAmenities.join(', ')}</p>
            )}
          </div>

          
          <div className="total-price">
            <strong>Total: ${totalPrice.toFixed(2)}</strong>
            {amenityCost > 0 && <p>Amenity Cost: +${amenityCost.toFixed(2)}</p>}
          </div>
          {vehicle.features && (
            <div className="detail-item features">
              <strong>Features:</strong> {vehicle.features}
            </div>
          )}
          {vehicle.description && (
            <div className="detail-item description">
              <strong>Description:</strong> {vehicle.description}
            </div>
          )}
        </div>
      </div>

      <div className="booking-actions">
        <button onClick={handleConfirmBooking} className="btn-confirm">
          <CheckCircle size={18} /> Confirm Booking
        </button>
        <button onClick={() => navigate('/search')} className="btn-cancel">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CompleteBooking;