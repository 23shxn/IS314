import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Car, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import '../styles/VehicleSearch.css';

const VehicleImageCarousel = ({ images, vehicleInfo }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const validImages = images.filter(img => img);

  if (validImages.length === 0) {
    return (
      <div className="placeholder-image">
        <Car size={40} />
      </div>
    );
  }

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % validImages.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);

  return (
    <div className="vehicle-image-carousel">
      <div className="image-container">
        <img
          src={`data:image/jpeg;base64,${validImages[currentIndex]}`}
          alt={`${vehicleInfo.make} ${vehicleInfo.model} - Image ${currentIndex + 1}`}
          className="carousel-image"
        />
        {validImages.length > 1 && (
          <>
            <button className="carousel-nav prev" onClick={prevImage}>
              <ChevronLeft size={20} />
            </button>
            <button className="carousel-nav next" onClick={nextImage}>
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      {validImages.length > 1 && (
        <div className="carousel-indicators">
          {validImages.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const VehicleDetailModal = ({ vehicle, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const vehicleImages = [vehicle.vehicleImage1, vehicle.vehicleImage2, vehicle.vehicleImage3].filter(img => img);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % vehicleImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + vehicleImages.length) % vehicleImages.length);

  if (!vehicle) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Vehicle Details</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          {vehicleImages.length > 0 && (
            <div className="vehicle-image-gallery">
              <div className="image-container">
                <img
                  src={`data:image/jpeg;base64,${vehicleImages[currentImageIndex]}`}
                  alt={`${vehicle.make} ${vehicle.model} - Image ${currentImageIndex + 1}`}
                  className="main-vehicle-image"
                />
                {vehicleImages.length > 1 && (
                  <>
                    <button className="image-nav prev" onClick={prevImage}>
                      <ChevronLeft size={24} />
                    </button>
                    <button className="image-nav next" onClick={nextImage}>
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
              <div className="image-indicators">
                {vehicleImages.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="vehicle-details-grid">
            <p><strong>Make:</strong> {vehicle.make}</p>
            <p><strong>Model:</strong> {vehicle.model}</p>
            <p><strong>Year:</strong> {vehicle.year}</p>
            <p><strong>Type:</strong> {vehicle.vehicleType}</p>
            <p><strong>Location:</strong> {vehicle.location}</p>
            <p><strong>Price/Day:</strong> ${vehicle.pricePerDay}</p>
            <p><strong>Fuel Type:</strong> {vehicle.fuelType || 'N/A'}</p>
            <p><strong>Transmission:</strong> {vehicle.transmission || 'N/A'}</p>
            <p><strong>Seating:</strong> {vehicle.seatingCapacity || 'N/A'}</p>
            <p><strong>Color:</strong> {vehicle.color || 'N/A'}</p>
            <p><strong>Description:</strong> {vehicle.description || 'N/A'}</p>
            <p><strong>Features:</strong> {vehicle.features || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const VehicleSearch = ({ reservations, setReservations, currentUser }) => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingVehicle, setViewingVehicle] = useState(null);
  const navigate = useNavigate();

  // Updated search params with separate pickup and dropoff locations
  const [searchParams, setSearchParams] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    vehicleType: '',
    minPrice: '',
    startDate: '',
    endDate: ''
  });

  // Predefined price ranges for dropdown
  const priceRanges = [
    { value: '', label: 'Any Price' },
    { value: '0-50', label: 'Under $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100-150', label: '$100 - $150' },
    { value: '150-200', label: '$150 - $200' },
    { value: '200+', label: '$200+' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
        const [vehiclesRes, locationsRes, typesRes] = await Promise.all([
          fetch(`${apiUrl}/api/vehicles/available`),
          fetch(`${apiUrl}/api/vehicles/locations`),
          fetch(`${apiUrl}/api/vehicles/types`)
        ]);

        if (vehiclesRes.ok) {
          const data = await vehiclesRes.json();
          setVehicles(Array.isArray(data) ? data : []);
        } else {
          setError('Failed to fetch vehicles');
        }

        if (locationsRes.ok) {
          const data = await locationsRes.json();
          setLocations(Array.isArray(data) ? data : []);
        }

        if (typesRes.ok) {
          const data = await typesRes.json();
          setVehicleTypes(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        setError('Failed to connect to server');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let results = [...vehicles];

    // Filter by pickup location (where vehicles are available)
    if (searchParams.pickupLocation) {
      results = results.filter(v => v.location.toLowerCase().includes(searchParams.pickupLocation.toLowerCase()));
    }

    // Filter by vehicle type
    if (searchParams.vehicleType) {
      results = results.filter(v => v.vehicleType.toLowerCase().includes(searchParams.vehicleType.toLowerCase()));
    }

    // Filter by price range
    if (searchParams.minPrice) {
      const priceRange = searchParams.minPrice;
      if (priceRange === '0-50') {
        results = results.filter(v => v.pricePerDay < 50);
      } else if (priceRange === '50-100') {
        results = results.filter(v => v.pricePerDay >= 50 && v.pricePerDay <= 100);
      } else if (priceRange === '100-150') {
        results = results.filter(v => v.pricePerDay >= 100 && v.pricePerDay <= 150);
      } else if (priceRange === '150-200') {
        results = results.filter(v => v.pricePerDay >= 150 && v.pricePerDay <= 200);
      } else if (priceRange === '200+') {
        results = results.filter(v => v.pricePerDay >= 200);
      }
    }

    setFilteredVehicles(results);
  }, [vehicles, searchParams]);

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleReservation = (vehicle) => {
    // Validate dates
    if (!searchParams.startDate || !searchParams.endDate) {
      setError('Please select both start and end dates to reserve a vehicle');
      return;
    }

    // Validate pickup location (required)
    if (!searchParams.pickupLocation) {
      setError('Please select a pickup location');
      return;
    }
    
    const startDate = new Date(searchParams.startDate);
    const endDate = new Date(searchParams.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setError('Start date cannot be in the past');
      return;
    }

    if (endDate <= startDate) {
      setError('End date must be after start date');
      return;
    }

    setError('');
    
    // Create reservation object with pickup and dropoff locations
    const reservation = {
      vehicle: vehicle,
      rentalDate: searchParams.startDate,
      returnDate: searchParams.endDate,
      pickupLocation: searchParams.pickupLocation,
      dropoffLocation: searchParams.dropoffLocation || searchParams.pickupLocation, // Default to pickup location if no dropoff specified
      userId: currentUser ? currentUser.id : null
    };

    console.log('Navigating to car-detail with reservation:', reservation);
    
    // Navigate to car detail page
    navigate('/car-detail', { 
      state: { 
        reservation: reservation
      } 
    });
  };

  const clearFilters = () => {
    setSearchParams({
      pickupLocation: '',
      dropoffLocation: '',
      vehicleType: '',
      minPrice: '',
      startDate: searchParams.startDate, // Keep dates
      endDate: searchParams.endDate
    });
    setError('');
  };

  const refreshVehicles = async () => {
    // Re-fetch vehicles to get updated availability
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const vehiclesRes = await fetch(`${apiUrl}/api/vehicles/available`);
      
      if (vehiclesRes.ok) {
        const data = await vehiclesRes.json();
        setVehicles(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to refresh vehicles');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Listen for reservation changes and refresh
    refreshVehicles();
  }, [reservations]);

  if (loading) {
    return (
      <div className="loading">
        <Car size={48} />
        <p>Loading vehicles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={() => setError('')}>Clear Error</button>
      </div>
    );
  }

  return (
    <div className="vehicle-search-container">
      <header className="search-header">
        <h1>Find a Vehicle</h1>
        <p>Select dates and pickup location to book. Use filters to narrow down options.</p>
        {!currentUser && (
          <div className="auth-notice">
            <p>Please <a href="/login">log in</a> to make reservations.</p>
          </div>
        )}
      </header>

      <div className="search-form">
        <div className="form-row">
          <div className="form-group required">
            <label>Start Date (Required)</label>
            <input
              type="date"
              value={searchParams.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div className="form-group required">
            <label>End Date (Required)</label>
            <input
              type="date"
              value={searchParams.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              min={searchParams.startDate || new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div className="form-group required">
            <label><MapPin size={16} /> Pickup Location (Required)</label>
            <select 
              value={searchParams.pickupLocation} 
              onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
              required
            >
              <option value="">Select Pickup Location</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label><MapPin size={16} /> Drop-off Location (Optional)</label>
            <select 
              value={searchParams.dropoffLocation} 
              onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
            >
              <option value="">Same as pickup</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <small style={{ color: '#666', fontSize: '12px' }}>
              Leave blank to return to pickup location
            </small>
          </div>
          <div className="form-group">
            <label><Car size={16} /> Vehicle Type</label>
            <select value={searchParams.vehicleType} onChange={(e) => handleInputChange('vehicleType', e.target.value)}>
              <option value="">All Types</option>
              {vehicleTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Price Range</label>
            <select value={searchParams.minPrice} onChange={(e) => handleInputChange('minPrice', e.target.value)}>
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-actions">
          <button onClick={clearFilters} className="btn btn-secondary btn-small">
            Clear Filters
          </button>
        </div>
      </div>

      <div className="results-summary">
        <h3>{filteredVehicles.length} vehicles found</h3>
        {searchParams.startDate && searchParams.pickupLocation && (
          <p>Available for pickup on {new Date(searchParams.startDate).toLocaleDateString('en-FJ')} from {searchParams.pickupLocation}</p>
        )}
        {searchParams.dropoffLocation && searchParams.dropoffLocation !== searchParams.pickupLocation && (
          <p>To be returned at {searchParams.dropoffLocation}</p>
        )}
      </div>

      <div className="search-results">
        {filteredVehicles.length === 0 ? (
          <div className="no-results">
            <Car size={48} />
            <h3>No vehicles found</h3>
            <p>Adjust your filters or dates to find available vehicles.</p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="vehicle-card">
              <div className="vehicle-image" onClick={() => setViewingVehicle(vehicle)}>
                <VehicleImageCarousel
                  images={[vehicle.vehicleImage1, vehicle.vehicleImage2, vehicle.vehicleImage3]}
                  vehicleInfo={{ make: vehicle.make, model: vehicle.model }}
                />
                <button className="action-btn view"><Eye size={16} /></button>
              </div>
              <div className="vehicle-info">
                <div className="vehicle-header">
                  <h4>{vehicle.make} {vehicle.model} ({vehicle.year})</h4>
                  <span className={`status-badge ${vehicle.status.toLowerCase()}`}>{vehicle.status}</span>
                </div>
                <div className="vehicle-details">
                  <p><Car size={16} /> {vehicle.vehicleType} | <MapPin size={16} /> Available at {vehicle.location}</p>
                  <p>Seats: {vehicle.seatingCapacity} | Fuel: {vehicle.fuelType} | {vehicle.transmission}</p>
                  {vehicle.mileage && <p>Mileage: {vehicle.mileage} km</p>}
                  {vehicle.features && <p><strong>Features:</strong> {vehicle.features}</p>}
                </div>
              </div>
              <div className="vehicle-booking">
                <div className="price-info">
                  <span className="price">${vehicle.pricePerDay}</span>
                  <span className="price-label">per day</span>
                </div>
                <button
                  onClick={() => handleReservation(vehicle)}
                  className="btn btn-primary"
                  disabled={vehicle.status !== 'Available' || !searchParams.startDate || !searchParams.endDate || !searchParams.pickupLocation}
                >
                  <Plus size={16} /> Reserve
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {viewingVehicle && <VehicleDetailModal vehicle={viewingVehicle} onClose={() => setViewingVehicle(null)} />}
    </div>
  );
};

export default VehicleSearch;