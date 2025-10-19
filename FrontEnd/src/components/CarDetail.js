import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Car, MapPin, CalendarDays, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import axios from 'axios';
import '../styles/CarDetail.css';

const VehicleImageCarousel = ({ images, vehicleInfo }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Helper: Validate Base64 (round-trip decode/encode check)
  const isValidBase64 = (str) => {
    if (!str || typeof str !== 'string') return false;
    try {
      return btoa(atob(str)) === str;
    } catch (e) {
      return false;
    }
  };

  // Helper: Detect MIME from Base64 header (fallback to jpeg)
  const getImageMimeType = (base64Str) => {
    if (!base64Str) return 'image/jpeg';
    const header = base64Str.substring(0, 20);
    if (header.includes('/9j/')) return 'image/jpeg';
    if (header.includes('iVBORw0KGgo')) return 'image/png';
    if (header.includes('R0lGODlh')) return 'image/gif';
    if (header.includes('UklGR')) return 'image/webp';
    return 'image/jpeg'; // Fallback
  };

  // Filter valid, non-empty images
  const validImages = images
    .filter(img => img?.trim() && isValidBase64(img.trim()))
    .map(img => img.trim());

  if (!validImages.length) {
    return <div className="placeholder-image"><Car size={60} /></div>;
  }

  const changeImage = (delta) => 
    setCurrentIndex((prev) => (prev + delta + validImages.length) % validImages.length);

  const handleImageError = (e, index) => {
    console.error(`Image ${index + 1} failed to load:`, e);
    // Hide broken image, but keep carousel functional
    e.target.style.display = 'none';
    // Optional: Swap to next valid if all fail, but for now, log
  };

  const currentImage = validImages[currentIndex];
  const mimeType = getImageMimeType(currentImage);

  return (
    <div className="image-carousel">
      <div className="image-container">
        <img 
          src={`data:${mimeType};base64,${currentImage}`} 
          alt={`${vehicleInfo.make} ${vehicleInfo.model}`} 
          className="carousel-image"
          onError={(e) => handleImageError(e, currentIndex)}
        />
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
            <button 
              key={i} 
              className={`indicator ${i === currentIndex ? 'active' : ''}`} 
              onClick={() => setCurrentIndex(i)} 
            />
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
  const [vehicle, setVehicle] = useState(state?.vehicle || null);
  const [amenities, setAmenities] = useState(['none']); // Default to 'none'
  const [error, setError] = useState('');

  // Update the availableAmenities to match backend EXACTLY
  const availableAmenities = [
    { id: 'none', name: 'None', price: 0 },
    { id: 'baby-sitter', name: 'Baby Sitter', price: 20 },
    { id: 'gps', name: 'GPS', price: 10 },
    { id: 'power-bank', name: 'Power Bank', price: 5 }
  ];

  useEffect(() => {
    if (vehicle && !reservation) {
      // If no reservation in state, perhaps fetch or set defaults
      setReservation({
        rentalDate: new Date().toISOString().split('T')[0], // Default today
        returnDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow
      });
    }
  }, [vehicle, reservation]);

  // Calculate days between rental and return
  const calculateDays = () => {
    if (!reservation?.rentalDate || !reservation?.returnDate) return 1;
    const start = new Date(reservation.rentalDate);
    const end = new Date(reservation.returnDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const days = calculateDays();
  const basePrice = (vehicle?.pricePerDay || 0) * days;
  const amenityCost = amenities
    .filter(id => id !== 'none')
    .reduce((total, id) => {
      const amenity = availableAmenities.find(a => a.id === id);
      return total + (amenity?.price || 0);
    }, 0);
  const taxRate = 0.15; // 15% tax
  const tax = (basePrice + amenityCost) * taxRate;
  const totalPrice = basePrice + amenityCost + tax;

  const handleAmenityChange = (e) => {
    const id = e.target.value;
    setAmenities(prev => {
      if (e.target.checked) {
        const newAmenities = prev.includes(id) ? prev : [...prev, id];
        // Remove 'none' if other amenities selected
        return newAmenities.filter(a => a !== 'none');
      } else {
        return prev.filter(a => a !== id);
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const proceedToCheckout = async () => {
    if (!vehicle || !currentUser) {
      setError('Missing vehicle or user data');
      return;
    }

    // Validate dates
    if (new Date(reservation.returnDate) <= new Date(reservation.rentalDate)) {
      setError('Return date must be after rental date');
      return;
    }

    try {
      // Prepare reservation data
      const reservationData = {
        vehicle: { id: vehicle.id },
        userId: currentUser.id,
        rentalDate: reservation.rentalDate,
        returnDate: reservation.returnDate,
        amenities: amenities.includes('none') ? [] : amenities,
        totalPrice: totalPrice
      };

      // POST to backend
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/reservations`, reservationData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      if (response.status === 201) {
        setReservations(prev => [...prev, response.data]);
        navigate('/checkout', { state: { reservation: response.data, totalPrice } });
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.error || 'Failed to create booking');
    }
  };

  if (!vehicle) {
    return <div className="loading">Loading vehicle details...</div>;
  }

  return (
    <div className="car-detail">
      <div className="detail-content">
        <div className="detail-main">
          <VehicleImageCarousel 
            images={[vehicle.vehicleImage1, vehicle.vehicleImage2, vehicle.vehicleImage3]} 
            vehicleInfo={vehicle} 
          />
          <div className="vehicle-info">
            <h1>{vehicle.make} {vehicle.model} {vehicle.year}</h1>
            <p className="vehicle-type">{vehicle.vehicleType} • {vehicle.transmission} • {vehicle.fuelType}</p>
            <p className="description">{vehicle.description || 'No description available.'}</p>
            <div className="features">
              <p><span>{vehicle.seatingCapacity} seats</span></p>
              <p><span>{vehicle.mileage} km</span></p>
              <p className="price-per-day">${vehicle.pricePerDay} FJD/day</p>
            </div>
          </div>
          <div className="amenities-section">
            <h3>Add-ons</h3>
            <div className="amenities-grid">
              {availableAmenities.map((amenity) => (
                <label key={amenity.id} className="amenity-option">
                  <input
                    type="checkbox"
                    value={amenity.id}
                    checked={amenities.includes(amenity.id)}
                    onChange={handleAmenityChange}
                  />
                  <span>{amenity.name} (+${amenity.price} FJD)</span>
                </label>
              ))}
            </div>
            {amenities.length > 0 && amenities[0] !== 'none' && (
              <p className="amenities-selected">
                Selected: {amenities.map(id => availableAmenities.find(a => a.id === id)?.name).join(', ')}
              </p>
            )}
          </div>
        </div>
        <div className="detail-sidebar">
          {error && <div className="error"><p>{error}</p><button onClick={() => setError('')}>Clear</button></div>}
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
          <div className="pricing">
            <p>Base Price ({days} day{days > 1 ? 's' : ''}): <span>{basePrice.toFixed(2)} FJD</span></p>
            {amenities.length > 0 && !amenities.includes('none') && (
              <p>Amenities: <span>+{amenityCost.toFixed(2)} FJD</span></p>
            )}
            <p>Tax (15%): <span>{tax.toFixed(2)} FJD</span></p>
            <hr />
            <p><strong>Total: <span>{totalPrice.toFixed(2)} FJD</span></strong></p>
            
            <button 
              onClick={proceedToCheckout} 
              className="btn primary" 
              disabled={!currentUser || !amenities.length}
            >
              <ArrowRight size={18} /> Proceed to Checkout
            </button>
            <button 
              onClick={() => navigate('/search')} 
              className="btn secondary"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;