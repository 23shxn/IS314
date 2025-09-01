import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MapPin, Car, Users, Fuel, Settings, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
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

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

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

  if (!vehicle) return null;
  
  const vehicleImages = [
    vehicle.vehicleImage1,
    vehicle.vehicleImage2,
    vehicle.vehicleImage3
  ].filter(img => img);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % vehicleImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + vehicleImages.length) % vehicleImages.length);
  };
  
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
            <p><strong>License Plate:</strong> {vehicle.licensePlate}</p>
            <p><strong>Make:</strong> {vehicle.make}</p>
            <p><strong>Model:</strong> {vehicle.model}</p>
            <p><strong>Year:</strong> {vehicle.year}</p>
            <p><strong>Type:</strong> {vehicle.vehicleType}</p>
            <p><strong>Color:</strong> {vehicle.color}</p>
            <p><strong>VIN:</strong> {vehicle.vin || 'N/A'}</p>
            <p><strong>Fuel Type:</strong> {vehicle.fuelType}</p>
            <p><strong>Transmission:</strong> {vehicle.transmission}</p>
            <p><strong>Seating Capacity:</strong> {vehicle.seatingCapacity}</p>
            <p><strong>Mileage:</strong> {vehicle.mileage || 'N/A'}</p>
            <p><strong>Price/Day:</strong> ${vehicle.pricePerDay}</p>
            <p><strong>Location:</strong> {vehicle.location}</p>
            <p><strong>Description:</strong> {vehicle.description || 'N/A'}</p>
            <p><strong>Features:</strong> {vehicle.features || 'N/A'}</p>
            <p><strong>Status:</strong> {vehicle.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const VehicleSearch = ({ reservations, setReservations, setCurrentView, currentUser }) => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingVehicle, setViewingVehicle] = useState(null);
  const navigate = useNavigate();
  
  const [searchParams, setSearchParams] = useState({
    location: '',
    vehicleType: '',
    minPrice: '',
    maxPrice: '',
    startDate: '',
    fuelType: '',
    transmission: '',
    seatingCapacity: ''
  });

  useEffect(() => {
    fetchVehicles();
    fetchLocations();
    fetchVehicleTypes();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, searchParams]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/vehicles/available', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVehicles(Array.isArray(data) ? data : []);
        setError('');
      } else {
        setError('Failed to fetch vehicles');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Fetch vehicles error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/vehicles/locations');
      if (response.ok) {
        const data = await response.json();
        setLocations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Fetch locations error:', err);
    }
  };

  const fetchVehicleTypes = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/vehicles/types');
      if (response.ok) {
        const data = await response.json();
        setVehicleTypes(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Fetch vehicle types error:', err);
    }
  };

  const filterVehicles = () => {
    let results = [...vehicles];

    if (searchParams.location) {
      results = results.filter(vehicle => 
        vehicle.location.toLowerCase().includes(searchParams.location.toLowerCase())
      );
    }

    if (searchParams.vehicleType) {
      results = results.filter(vehicle => 
        vehicle.vehicleType.toLowerCase().includes(searchParams.vehicleType.toLowerCase())
      );
    }

    if (searchParams.minPrice) {
      results = results.filter(vehicle => 
        vehicle.pricePerDay >= parseFloat(searchParams.minPrice)
      );
    }

    if (searchParams.maxPrice) {
      results = results.filter(vehicle => 
        vehicle.pricePerDay <= parseFloat(searchParams.maxPrice)
      );
    }

    if (searchParams.fuelType) {
      results = results.filter(vehicle => 
        vehicle.fuelType && vehicle.fuelType.toLowerCase().includes(searchParams.fuelType.toLowerCase())
      );
    }

    if (searchParams.transmission) {
      results = results.filter(vehicle => 
        vehicle.transmission && vehicle.transmission.toLowerCase().includes(searchParams.transmission.toLowerCase())
      );
    }

    if (searchParams.seatingCapacity) {
      results = results.filter(vehicle => 
        vehicle.seatingCapacity >= parseInt(searchParams.seatingCapacity)
      );
    }

    if (searchParams.startDate) {
      results = results.filter(vehicle => 
        !reservations.some(res => 
          res.vehicleId === vehicle.id && res.rentalDate === searchParams.startDate
        )
      );
    }

    setFilteredVehicles(results);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterVehicles();
  };

  const handleReservation = (vehicle) => {
    if (!currentUser) {
      alert('Please login to make a reservation');
      navigate('/login');
      return;
    }

    if (!searchParams.startDate) {
      alert('Please select a start date');
      return;
    }

    const reservation = {
      id: Date.now(),
      vehicleId: vehicle.id,
      userId: currentUser.id,
      vehicle: vehicle,
      rentalDate: searchParams.startDate,
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    setReservations(prevReservations => [...prevReservations, reservation]);
    alert(`Successfully reserved ${vehicle.make} ${vehicle.model} for ${searchParams.startDate}`);
    navigate('/reservations');
  };

  const clearFilters = () => {
    setSearchParams({
      location: '',
      vehicleType: '',
      minPrice: '',
      maxPrice: '',
      startDate: '',
      fuelType: '',
      transmission: '',
      seatingCapacity: ''
    });
  };

  if (loading) {
    return (
      <div className="search-container">
        <h2>Search Vehicles</h2>
        <div className="card">
          <p>Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-container">
      <div className="search-header">
        <h2>Find Your Perfect Ride</h2>
        <p>Choose from our wide selection of vehicles</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchVehicles}>Retry</button>
        </div>
      )}

      <div className="card search-form-card">
        <h3>Search Filters</h3>
        <div className="search-form">
          <div className="form-row">
            <div className="form-group">
              <label><MapPin size={16} /> Location</label>
              <select
                value={searchParams.location}
                onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label><Car size={16} /> Vehicle Type</label>
              <select
                value={searchParams.vehicleType}
                onChange={(e) => setSearchParams({...searchParams, vehicleType: e.target.value})}
              >
                <option value="">All Types</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={searchParams.startDate}
                onChange={(e) => setSearchParams({...searchParams, startDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Min Price ($)</label>
              <input
                type="number"
                value={searchParams.minPrice}
                onChange={(e) => setSearchParams({...searchParams, minPrice: e.target.value})}
                placeholder="Min price per day"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Max Price ($)</label>
              <input
                type="number"
                value={searchParams.maxPrice}
                onChange={(e) => setSearchParams({...searchParams, maxPrice: e.target.value})}
                placeholder="Max price per day"
                min="0"
              />
            </div>

            <div className="form-group">
              <label><Fuel size={16} /> Fuel Type</label>
              <select
                value={searchParams.fuelType}
                onChange={(e) => setSearchParams({...searchParams, fuelType: e.target.value})}
              >
                <option value="">All Fuel Types</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><Settings size={16} /> Transmission</label>
              <select
                value={searchParams.transmission}
                onChange={(e) => setSearchParams({...searchParams, transmission: e.target.value})}
              >
                <option value="">All Transmissions</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div className="form-group">
              <label><Users size={16} /> Min Seats</label>
              <select
                value={searchParams.seatingCapacity}
                onChange={(e) => setSearchParams({...searchParams, seatingCapacity: e.target.value})}
              >
                <option value="">Any</option>
                <option value="2">2+ Seats</option>
                <option value="4">4+ Seats</option>
                <option value="5">5+ Seats</option>
                <option value="7">7+ Seats</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
              <button onClick={handleSearch} className="btn-primary search-btn">
                <Search size={16} /> Search
              </button>
              <button onClick={clearFilters} className="btn-secondary">
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="results-summary">
        <h3>Search Results ({filteredVehicles.length} vehicles found)</h3>
        {searchParams.startDate && (
          <p>Available for pickup on {new Date(searchParams.startDate).toLocaleDateString()}</p>
        )}
      </div>

      <div className="search-results">
        {filteredVehicles.length === 0 ? (
          <div className="no-results">
            <Car size={48} style={{ opacity: 0.3 }} />
            <h3>No vehicles found</h3>
            <p>Try adjusting your search filters to find available vehicles.</p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="vehicle-card">
              <div 
                className="vehicle-image"
                onClick={() => setViewingVehicle(vehicle)}
                style={{ cursor: 'pointer' }}
                title="View Details"
              >
                <VehicleImageCarousel 
                  images={[vehicle.vehicleImage1, vehicle.vehicleImage2, vehicle.vehicleImage3]}
                  vehicleInfo={{ make: vehicle.make, model: vehicle.model }}
                />
                <button className="action-btn view" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <Eye size={16} />
                </button>
              </div>
              
              <div className="vehicle-info">
                <div className="vehicle-header">
                  <h4>{vehicle.make} {vehicle.model} ({vehicle.year})</h4>
                  <span className={`status-badge ${vehicle.status.toLowerCase()}`}>
                    {vehicle.status}
                  </span>
                </div>
                
                <div className="vehicle-details">
                  <div className="detail-row">
                    <span><Car size={16} /> {vehicle.vehicleType}</span>
                    <span><MapPin size={16} /> {vehicle.location}</span>
                  </div>
                  <div className="detail-row">
                    <span><Users size={16} /> {vehicle.seatingCapacity} seats</span>
                    <span><Fuel size={16} /> {vehicle.fuelType}</span>
                  </div>
                  <div className="detail-row">
                    <span><Settings size={16} /> {vehicle.transmission}</span>
                    {vehicle.mileage && <span>{vehicle.mileage} km</span>}
                  </div>
                  {vehicle.features && (
                    <div className="features">
                      <strong>Features:</strong> {vehicle.features}
                    </div>
                  )}
                  {vehicle.description && (
                    <div className="description">
                      {vehicle.description}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="vehicle-booking">
                <div className="price-info">
                  <span className="price">${vehicle.pricePerDay}</span>
                  <span className="price-label">per day</span>
                </div>
                <button
                  onClick={() => handleReservation(vehicle)}
                  className="btn-primary reserve-btn"
                  disabled={vehicle.status !== 'Available' || !searchParams.startDate}
                >
                  <Plus size={16} /> Reserve Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {viewingVehicle && (
        <VehicleDetailModal 
          vehicle={viewingVehicle} 
          onClose={() => setViewingVehicle(null)} 
        />
      )}
    </div>
  );
};

export default VehicleSearch;