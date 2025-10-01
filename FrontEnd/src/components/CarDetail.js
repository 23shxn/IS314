import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Car, MapPin, CheckCircle, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import '../styles/CarDetail.css';

const VehicleImageCarousel = ({ images, vehicleInfo }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const validImages = images.filter(img => img?.trim());

  if (!validImages.length) {
    return <div className="placeholder-image"><Car size={60} /></div>;
  }

  const changeImage = (delta) => setCurrentIndex((prev) => (prev + delta + validImages.length) % validImages.length);

  return (
    <div className="image-carousel">
      <div className="image-container">
        <img src={`data:image/jpeg;base64,${validImages[currentIndex]}`} alt={`${vehicleInfo.make} ${vehicleInfo.model}`} className="carousel-image" />
        {validImages.length > 1 && (
          <>
            <button className="carousel-nav prev" onClick={() => changeImage(-1)}><ChevronLeft size={24} /></button>
            <button className="carousel-nav next" onClick={() => changeImage(1)}><ChevronRight size={24} /></button>
          </>
        )}
      </div>
      {validImages.length > 1 && (
        <div className="carousel-indicators">
          {validImages.map((_, i) => (
            <button key={i} className={`indicator ${i === currentIndex ? 'active' : ''}`} onClick={() => setCurrentIndex(i)} />
          ))}
        </div>
      )}
    </div>
  );
};

const CarDetail = ({ reservations, setReservations, currentUser }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(state?.reservation);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update the availableAmenities to match backend EXACTLY
  const availableAmenities = [
    { id: 'none', name: 'None', price: 0 },
    { id: 'baby-sitter', name: 'Baby Sitter', price: 20 },
    { id: 'gps', name: 'GPS Navigation', price: 10 },
    { id: 'power-bank', name: 'Power Bank', price: 5 }
  ];

  useEffect(() => {
    if (!reservation || !currentUser) {
      navigate('/search');
    }
    // Log API URL for debugging
    console.log('API URL:', process.env.REACT_APP_API_URL);
  }, [reservation, currentUser, navigate]);

  const formatDate = (date) => new Date(date).toLocaleDateString('en-FJ', { timeZone: 'Pacific/Fiji' });
  const formatDateForBackend = (date) => new Date(date).toISOString().split('T')[0]; // Convert to YYYY-MM-DD

  // Fix the days calculation to match backend logic
  const days = reservation ? 
    Math.floor((new Date(reservation.returnDate) - new Date(reservation.rentalDate)) / (1000 * 60 * 60 * 24)) + 1 
    : 1;

  const basePrice = reservation ? days * reservation.vehicle.pricePerDay : 0;

  // Map amenity prices for calculations (make sure these match backend exactly)
  const amenityPrices = {
    'none': 0,
    'baby-sitter': 20,
    'gps': 10,
    'power-bank': 5
  };

  const amenityCost = amenities.includes('none') || amenities.length === 0 ? 
    0 : 
    amenities.reduce((sum, amenityId) => sum + (amenityPrices[amenityId] || 0), 0);

  const totalPrice = basePrice + amenityCost;

  const handleAmenityChange = (amenity, checked) => {
    setAmenities(prev => {
      if (amenity === 'none') {
        return checked ? ['none'] : [];
      }
      if (checked) {
        return prev.includes('none') ? [amenity] : [...prev, amenity];
      }
      return prev.filter(a => a !== amenity);
    });
  };

  const confirmBooking = async () => {
    if (!amenities.length) {
      setError('Select at least one amenity or "None"');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Debug logging to match backend calculation
      console.log('Frontend calculation debug:');
      console.log('- Rental date:', reservation.rentalDate);
      console.log('- Return date:', reservation.returnDate);
      console.log('- Days calculated:', days);
      console.log('- Price per day:', reservation.vehicle.pricePerDay);
      console.log('- Base price:', basePrice);
      console.log('- Selected amenities:', amenities);
      console.log('- Amenity cost:', amenityCost);
      console.log('- Total price:', totalPrice);
      
      const data = {
        vehicle: { id: reservation.vehicle.id },
        userId: currentUser.id,
        rentalDate: formatDateForBackend(reservation.rentalDate),
        returnDate: formatDateForBackend(reservation.returnDate),
        status: 'Confirmed',
        amenities: amenities,
        totalPrice: parseFloat(totalPrice.toFixed(2))
      };
      
      console.log('Booking request data:', data);
      
      const response = await axios.post('http://localhost:8080/api/reservations', data, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('Booking response:', response.data);
      setReservations(prev => [...prev, { ...response.data, vehicle: reservation.vehicle }]);
      alert(`Successfully booked ${reservation.vehicle.make} ${reservation.vehicle.model}!`);
      navigate('/reservations');
      
    } catch (err) {
      console.error('Booking error:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = 'Booking failed. Please try again.';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data) {
        errorMessage = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!reservation) return <div className="loading">Loading...</div>;

  const vehicle = reservation.vehicle;
  const details = [
    { label: 'Type', field: 'vehicleType' },
    { label: 'Transmission', field: 'transmission' },
    { label: 'Seats', field: 'seatingCapacity' },
    { label: 'Fuel', field: 'fuelType' },
    { label: 'Color', field: 'color' },
    { label: 'Description', field: 'description' },
    { label: 'Features', field: 'features' }
  ].map(({ label, field }) => ({
    label,
    value: vehicle[field] || 'N/A'
  }));

  return (
    <div className="car-detail-container">
      <header className="detail-header">
        <h1>Car Detail</h1>
        <p>Review your reservation</p>
      </header>
      <div className="detail-content">
        <div className="detail-main">
          <h2>{vehicle.make} {vehicle.model} ({vehicle.year})</h2>
          <VehicleImageCarousel images={[vehicle.vehicleImage1, vehicle.vehicleImage2, vehicle.vehicleImage3]} vehicleInfo={vehicle} />
          <div className="vehicle-details">
            {details.map(({ label, value }) => (
              <p key={label}><strong>{label}:</strong> {value}</p>
            ))}
          </div>
          <div className="amenities">
            <label className="amenities-label">Add Amenities</label>
            <div className="amenities-options">
              {availableAmenities.map(amenity => (
                <label key={amenity.id} className="amenity-checkbox">
                  <input
                    type="checkbox"
                    value={amenity.id}
                    checked={amenities.includes(amenity.id)}
                    onChange={(e) => handleAmenityChange(amenity.id, e.target.checked)}
                  />
                  <span>{amenity.name} (+${amenity.price} FJD)</span>
                </label>
              ))}
            </div>
            {amenities.length > 0 && (
              <p className="amenities-selected">
                Selected: {amenities.map(id => availableAmenities.find(a => a.id === id).name).join(', ')}
              </p>
            )}
          </div>
        </div>
        <div className="detail-sidebar">
          {error && <div className="error"><p>{error}</p><button onClick={() => setError('')}>Clear</button></div>}
          <div className="pickup-dropoff">
            <div className="pickup"><h4>Pick-up</h4><p><CalendarDays size={16} /> {formatDate(reservation.rentalDate)}</p><p><MapPin size={16} /> {vehicle.location}</p></div>
            <div className="dropoff"><h4>Drop-off</h4><p><CalendarDays size={16} /> {formatDate(reservation.returnDate)}</p></div>
          </div>
          <div className="pricing">
            <p>Base Price ({days} day{days > 1 ? 's' : ''}): <span>{basePrice.toFixed(2)} FJD</span></p>
            {amenities.length > 0 && !amenities.includes('none') && (
              <p>Amenities: <span>+{amenityCost.toFixed(2)} FJD</span></p>
            )}
            <p>Total: <span>{totalPrice.toFixed(2)} FJD</span></p>
            <button onClick={confirmBooking} className="btn primary" disabled={loading || !currentUser}>
              <CheckCircle size={18} /> {loading ? 'Confirming...' : 'Confirm'}
            </button>
            <button onClick={() => navigate('/search')} className="btn secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;