import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Layout, Users, Car, ClipboardList, ToolCase, Check, X, Plus, Trash2, Eye, ChevronLeft, ChevronRight, Edit, Calendar } from 'lucide-react';
import '../styles/VehicleManagement.css';

// VehicleDetailModal Component with Robust Image Handling
const VehicleDetailModal = ({ vehicle, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
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

  // Filter valid, non-empty images from vehicleImage1,2,3
  const images = [vehicle.vehicleImage1, vehicle.vehicleImage2, vehicle.vehicleImage3]
    .filter(img => img?.trim() && isValidBase64(img.trim()))
    .map(img => img.trim());

  if (!images.length) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{vehicle.make} {vehicle.model} Details</h2>
            <button onClick={onClose} className="close-btn"><X size={24} /></button>
          </div>
          <div className="no-images-placeholder">
            <Car size={60} />
            <p>No images available for this vehicle.</p>
          </div>
          {/* Vehicle Details */}
          <div className="vehicle-details">
            <p><strong>Year:</strong> {vehicle.year}</p>
            <p><strong>Color:</strong> {vehicle.color || 'N/A'}</p>
            <p><strong>License Plate:</strong> {vehicle.licensePlate}</p>
            <p><strong>VIN:</strong> {vehicle.vin || 'N/A'}</p>
            <p><strong>Fuel Type:</strong> {vehicle.fuelType || 'N/A'}</p>
            <p><strong>Transmission:</strong> {vehicle.transmission || 'N/A'}</p>
            <p><strong>Seating Capacity:</strong> {vehicle.seatingCapacity || 'N/A'}</p>
            <p><strong>Mileage:</strong> {vehicle.mileage || 'N/A'} km</p>
            <p><strong>Price per Day:</strong> ${vehicle.pricePerDay || 'N/A'} FJD</p>
            <p><strong>Location:</strong> {vehicle.location}</p>
            <p><strong>Status:</strong> {vehicle.status}</p>
            {vehicle.description && <p><strong>Description:</strong> {vehicle.description}</p>}
            {vehicle.features && <p><strong>Features:</strong> {vehicle.features}</p>}
          </div>
        </div>
      </div>
    );
  }

  const changeImage = (delta) => 
    setCurrentImageIndex((prev) => (prev + delta + images.length) % images.length);

  const handleImageError = (e, index) => {
    console.error(`Image ${index + 1} failed to load:`, e);
    e.target.style.display = 'none';
   
    e.target.nextElementSibling.style.display = 'flex';
  };

  const currentImage = images[currentImageIndex];
  const mimeType = getImageMimeType(currentImage);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{vehicle.make} {vehicle.model} Details</h2>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>
        
        {/* Image Carousel */}
        <div className="image-carousel">
          <div className="image-container">
            <img 
              src={`data:${mimeType};base64,${currentImage}`} 
              alt={`${vehicle.make} ${vehicle.model} - Image ${currentImageIndex + 1}`} 
              className="modal-image"
              onError={(e) => handleImageError(e, currentImageIndex)}
            />
            <div className="image-placeholder" style={{ display: 'none' }}>
              <Car size={60} />
              <p>Image unavailable</p>
            </div>
            {images.length > 1 && (
              <>
                <button className="carousel-nav prev" onClick={() => changeImage(-1)}><ChevronLeft size={24} /></button>
                <button className="carousel-nav next" onClick={() => changeImage(1)}><ChevronRight size={24} /></button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="carousel-indicators">
              {images.map((_, i) => (
                <button 
                  key={i} 
                  className={`indicator ${i === currentImageIndex ? 'active' : ''}`} 
                  onClick={() => setCurrentImageIndex(i)} 
                />
              ))}
            </div>
          )}
          <div className="image-index">{currentImageIndex + 1} / {images.length}</div>
        </div>
        
        {/* Vehicle Details */}
        <div className="vehicle-details">
          <p><strong>Year:</strong> {vehicle.year}</p>
          <p><strong>Color:</strong> {vehicle.color || 'N/A'}</p>
          <p><strong>License Plate:</strong> {vehicle.licensePlate}</p>
          <p><strong>VIN:</strong> {vehicle.vin || 'N/A'}</p>
          <p><strong>Fuel Type:</strong> {vehicle.fuelType || 'N/A'}</p>
          <p><strong>Transmission:</strong> {vehicle.transmission || 'N/A'}</p>
          <p><strong>Seating Capacity:</strong> {vehicle.seatingCapacity || 'N/A'}</p>
          <p><strong>Mileage:</strong> {vehicle.mileage || 'N/A'} km</p>
          <p><strong>Price per Day:</strong> ${vehicle.pricePerDay || 'N/A'} FJD</p>
          <p><strong>Location:</strong> {vehicle.location}</p>
          <p><strong>Status:</strong> {vehicle.status}</p>
          {vehicle.description && <p><strong>Description:</strong> {vehicle.description}</p>}
          {vehicle.features && <p><strong>Features:</strong> {vehicle.features}</p>}
        </div>
      </div>
    </div>
  );
};

const VehicleManagementManager = ({ setCurrentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewingVehicle, setViewingVehicle] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [vehicleDetails, setVehicleDetails] = useState({});
  const [formError, setFormError] = useState('');

  const approveRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this request?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicles/pending/${requestId}/approve`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Request approved successfully');
        fetchPendingRequests();
        fetchVehicles(); 
      } else {
        alert('Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error approving request');
    }
  };

  const rejectRequest = async (requestId) => {
    const reason = prompt('Enter rejection reason (optional):');
    if (reason === null) return; 

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicles/pending/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
        credentials: 'include'
      });

      if (response.ok) {
        alert('Request rejected successfully');
        fetchPendingRequests();
      } else {
        alert('Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request');
    }
  };

  useEffect(() => {
    console.log('VehicleManagement mounted, fetching vehicles...');
    fetchCurrentAdmin();
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (isSuperAdmin()) {
      fetchPendingRequests();
    }
  }, [currentAdmin]);

  const fetchCurrentAdmin = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/current`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const admin = await response.json();
        setCurrentAdmin(admin);
      }
    } catch (error) {
      console.error('Failed to fetch current admin:', error);
    }
  };

  const isSuperAdmin = () => {
    return currentAdmin && currentAdmin.role === 'SUPER_ADMIN';
  };

  // Validation functions
  const validateLicensePlate = (licensePlate) => {
    // Format: AB 123 (two letters, space, three numbers)
    const licensePlateRegex = /^[A-Za-z]{2}\s\d{3}$/;
    return licensePlateRegex.test(licensePlate);
  };

  const validateVin = (vin) => {
    // Basic VIN validation (17 characters, alphanumeric)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return !vin || vinRegex.test(vin);
  };

  const validateYear = (year) => {
    const currentYear = new Date().getFullYear();
    const vehicleYear = parseInt(year);
    return vehicleYear >= 1900 && vehicleYear <= currentYear;
  };

  const validatePrice = (price) => {
    const priceNum = parseFloat(price);
    return priceNum > 0 && priceNum <= 10000; // Reasonable upper limit
  };

  const validateSeatingCapacity = (capacity) => {
    const capNum = parseInt(capacity);
    return capNum >= 2 && capNum <= 50;
  };

  const validateMileage = (mileage) => {
    const mileNum = parseInt(mileage);
    return !mileage || (mileNum >= 0 && mileNum <= 500000);
  };

  const validateVehicleType = (type) => {
    return ['Sedan', 'SUV', 'Truck', 'Van'].includes(type);
  };

  const validateFuelType = (fuel) => {
    return ['Petrol', 'Diesel', 'Electric', 'Hybrid'].includes(fuel);
  };

  const validateTransmission = (trans) => {
    return ['Automatic', 'Manual'].includes(trans);
  };

  const validateLocation = (loc) => {
    return ['Suva', 'Nadi', 'Lautoka'].includes(loc);
  };

  const validateForm = (vehicleData) => {
    const errors = {};

    if (!validateLicensePlate(vehicleData.licensePlate)) {
      errors.licensePlate = 'License plate must be in format: AB 123';
    }

    if (vehicleData.vin && !validateVin(vehicleData.vin)) {
      errors.vin = 'VIN must be 17 alphanumeric characters';
    }

    if (!validateYear(vehicleData.year)) {
      errors.year = 'Year must be between 1900 and current year';
    }

    if (!validatePrice(vehicleData.pricePerDay)) {
      errors.pricePerDay = 'Price per day must be greater than 0 and up to 10,000 FJD';
    }

    if (!validateSeatingCapacity(vehicleData.seatingCapacity)) {
      errors.seatingCapacity = 'Seating capacity must be between 2 and 50';
    }

    if (vehicleData.mileage && !validateMileage(vehicleData.mileage)) {
      errors.mileage = 'Mileage must be between 0 and 500,000 km';
    }

    if (!validateVehicleType(vehicleData.vehicleType)) {
      errors.vehicleType = 'Vehicle type must be Sedan, SUV, Truck, or Van';
    }

    if (!validateFuelType(vehicleData.fuelType)) {
      errors.fuelType = 'Fuel type must be Petrol, Diesel, Electric, or Hybrid';
    }

    if (!validateTransmission(vehicleData.transmission)) {
      errors.transmission = 'Transmission must be Automatic or Manual';
    }

    if (!validateLocation(vehicleData.location)) {
      errors.location = 'Location must be Suva, Nadi, or Lautoka';
    }

    return errors;
  };

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicles/all`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch vehicles');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicles/pending/all`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setPendingRequests(Array.isArray(data) ? data : []);

        // Fetch vehicle details for REMOVE requests
        const details = {};
        for (const request of data) {
          if (request.changeType === 'REMOVE' && request.vehicleId) {
            try {
              const vehicleResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicles/${request.vehicleId}`, {
                method: 'GET',
                credentials: 'include'
              });
              if (vehicleResponse.ok) {
                const vehicle = await vehicleResponse.json();
                details[request.id] = vehicle;
              }
            } catch (err) {
              console.error('Error fetching vehicle details:', err);
            }
          }
        }
        setVehicleDetails(details);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const handleAddVehicle = () => {
    navigate('/manager/vehicles/add');
  };







  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

    if (!isSuperAdmin()) {
      // For regular admins, submit pending request
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicles/pending/remove/${vehicleId}`, {
          method: 'POST',
          credentials: 'include'
        });

        if (response.ok) {
          alert('Vehicle delete request submitted for approval');
        } else {
          alert('Failed to submit delete request');
        }
      } catch (error) {
        console.error('Error submitting delete request:', error);
        alert('Error submitting delete request');
      }
      return;
    }

    // For super admins, direct delete
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setVehicles(prev => prev.filter(v => v.id !== vehicleId));
        alert('Vehicle deleted successfully');
      } else {
        alert('Failed to delete vehicle');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Error deleting vehicle');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.clear();
    sessionStorage.clear();
    setCurrentUser(null);
    navigate('/login');
  };

  const handleNavigation = (path) => {
    if (isSuperAdmin()) {
      navigate(`/manager/${path}`);
    } else {
      navigate(`/admin/${path}`);
    }
  };

  if (loading && vehicles.length === 0) {
    return <div className="loading">Loading vehicles...</div>;
  }

  return (
    <div className="vehicle-management">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Ronaldo's Rentals Dashboard</h2>
        </div>
        <div className="sidebar-menu">
          <button
            onClick={() => handleNavigation('dashboard')}
            className={`sidebar-btn ${location.pathname.includes('dashboard') ? 'active' : ''}`}
          >
            <Layout className="btn-icon" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => handleNavigation('vehicles')}
            className={`sidebar-btn ${location.pathname.includes('vehicles') ? 'active' : ''}`}
          >
            <Car className="btn-icon" />
            <span>Vehicle Management</span>
          </button>
          {isSuperAdmin() && (
            <button
              onClick={() => handleNavigation('pending-requests')}
              className={`sidebar-btn ${location.pathname.includes('pending-requests') ? 'active' : ''}`}
            >
              <ClipboardList className="btn-icon" />
              <span>Pending Requests</span>
            </button>
          )}
          <button
            onClick={() => handleNavigation('users')}
            className={`sidebar-btn ${location.pathname.includes('users') ? 'active' : ''}`}
          >
            <Users className="btn-icon" />
            <span>Customer Management</span>
          </button>
          <button
            onClick={() => handleNavigation('maintenance')}
            className={`sidebar-btn ${location.pathname.includes('maintenance') ? 'active' : ''}`}
          >
            <ToolCase className="btn-icon" />
            <span>Maintenance</span>
          </button>
          <button
            onClick={() => handleNavigation('reservations')}
            className={`sidebar-btn ${location.pathname.includes('reservations') ? 'active' : ''}`}
          >
            <Calendar className="btn-icon" />
            <span>Reservations</span>
          </button>
        </div>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-btn logout">
            <LogOut className="btn-icon" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="main-content">
        <div className="page-header">
          <h1>Vehicle Management</h1>
          {error && <div className="error-message">{error}</div>}
          {formError && <div className="form-error">{formError}</div>}
          <button
            onClick={handleAddVehicle}
            className="btn-primary add-vehicle-btn"
            disabled={loading}
          >
            <Plus size={20} /> Add New Vehicle
          </button>
        </div>





        {pendingRequests.length > 0 && isSuperAdmin() && (
          <div className="pending-section">
            <h3>Pending Vehicle Requests ({pendingRequests.length})</h3>
            <div className="pending-list">
              {pendingRequests.map(request => {
                let vehicleInfo = null;
                let images = [];
                if (request.changeType === 'ADD') {
                  try {
                    const data = JSON.parse(request.vehicleData);
                    vehicleInfo = {
                      make: data.make,
                      model: data.model,
                      year: data.year,
                      licensePlate: data.licensePlate,
                      location: data.location,
                      pricePerDay: data.pricePerDay,
                      color: data.color,
                      vin: data.vin,
                      fuelType: data.fuelType,
                      transmission: data.transmission,
                      seatingCapacity: data.seatingCapacity,
                      mileage: data.mileage,
                      description: data.description,
                      features: data.features
                    };
                    images = [data.vehicleImage1, data.vehicleImage2, data.vehicleImage3].filter(img => img);
                  } catch (e) {
                    console.error('Error parsing vehicle data:', e);
                  }
                } else if (request.changeType === 'REMOVE') {
                  const vehicle = vehicleDetails[request.id];
                  if (vehicle) {
                    vehicleInfo = {
                      make: vehicle.make,
                      model: vehicle.model,
                      year: vehicle.year,
                      licensePlate: vehicle.licensePlate,
                      location: vehicle.location,
                      pricePerDay: vehicle.pricePerDay,
                      color: vehicle.color,
                      vin: vehicle.vin,
                      fuelType: vehicle.fuelType,
                      transmission: vehicle.transmission,
                      seatingCapacity: vehicle.seatingCapacity,
                      mileage: vehicle.mileage,
                      description: vehicle.description,
                      features: vehicle.features
                    };
                    images = [vehicle.vehicleImage1, vehicle.vehicleImage2, vehicle.vehicleImage3].filter(img => img);
                  }
                }

                return (
                  <div key={request.id} className="pending-item">
                    <div className="pending-header">
                      <h4>Request to {request.changeType.toLowerCase()} vehicle</h4>
                      <span className="request-type">{request.changeType}</span>
                    </div>
                    {vehicleInfo && (
                      <div className="vehicle-details-full">
                        <div className="vehicle-basic-info">
                          <p><strong>Vehicle:</strong> {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</p>
                          <p><strong>License Plate:</strong> {vehicleInfo.licensePlate}</p>
                          <p><strong>Color:</strong> {vehicleInfo.color || 'N/A'}</p>
                          <p><strong>VIN:</strong> {vehicleInfo.vin || 'N/A'}</p>
                          <p><strong>Fuel Type:</strong> {vehicleInfo.fuelType}</p>
                          <p><strong>Transmission:</strong> {vehicleInfo.transmission}</p>
                          <p><strong>Seating Capacity:</strong> {vehicleInfo.seatingCapacity}</p>
                          <p><strong>Mileage:</strong> {vehicleInfo.mileage ? `${vehicleInfo.mileage} km` : 'N/A'}</p>
                          <p><strong>Location:</strong> {vehicleInfo.location}</p>
                          <p><strong>Price/Day:</strong> ${vehicleInfo.pricePerDay} FJD</p>
                          {vehicleInfo.description && <p><strong>Description:</strong> {vehicleInfo.description}</p>}
                          {vehicleInfo.features && <p><strong>Features:</strong> {vehicleInfo.features}</p>}
                        </div>
                        {images.length > 0 && (
                          <div className="vehicle-images">
                            <h5>Vehicle Images:</h5>
                            <div className="image-carousel-container">
                              <div className="image-container">
                                <img
                                  src={`data:image/jpeg;base64,${images[0]}`}
                                  alt="Vehicle"
                                  className="pending-vehicle-image"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                              {images.length > 1 && (
                                <div className="carousel-controls">
                                  <button
                                    className="carousel-btn prev"
                                    onClick={(e) => {
                                      const container = e.target.closest('.pending-item');
                                      const img = container.querySelector('.pending-vehicle-image');
                                      const currentSrc = img.src;
                                      const currentIndex = images.findIndex(imgData => `data:image/jpeg;base64,${imgData}` === currentSrc);
                                      const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
                                      img.src = `data:image/jpeg;base64,${images[newIndex]}`;
                                      const indicators = container.querySelectorAll('.indicator');
                                      indicators.forEach((ind, idx) => {
                                        ind.classList.toggle('active', idx === newIndex);
                                      });
                                    }}
                                  >
                                    ‹
                                  </button>
                                  <div className="carousel-indicators">
                                    {images.map((_, i) => (
                                      <button
                                        key={i}
                                        className={`indicator ${i === 0 ? 'active' : ''}`}
                                        onClick={(e) => {
                                          const container = e.target.closest('.pending-item');
                                          const img = container.querySelector('.pending-vehicle-image');
                                          img.src = `data:image/jpeg;base64,${images[i]}`;
                                          const indicators = container.querySelectorAll('.indicator');
                                          indicators.forEach((ind, idx) => {
                                            ind.classList.toggle('active', idx === i);
                                          });
                                        }}
                                      />
                                    ))}
                                  </div>
                                  <button
                                    className="carousel-btn next"
                                    onClick={(e) => {
                                      const container = e.target.closest('.pending-item');
                                      const img = container.querySelector('.pending-vehicle-image');
                                      const currentSrc = img.src;
                                      const currentIndex = images.findIndex(imgData => `data:image/jpeg;base64,${imgData}` === currentSrc);
                                      const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
                                      img.src = `data:image/jpeg;base64,${images[newIndex]}`;
                                      const indicators = container.querySelectorAll('.indicator');
                                      indicators.forEach((ind, idx) => {
                                        ind.classList.toggle('active', idx === newIndex);
                                      });
                                    }}
                                  >
                                    ›
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="pending-actions">
                      <button onClick={() => approveRequest(request.id)} className="btn-small approve">Approve</button>
                      <button onClick={() => rejectRequest(request.id)} className="btn-small reject">Reject</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="vehicles-table-container">
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>License Plate</th>
                <th>Make & Model</th>
                <th>Year</th>
                <th>Type</th>
                <th>Location</th>
                <th>Price/Day</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td data-label="License Plate">{vehicle.licensePlate}</td>
                  <td data-label="Make & Model">
                    {vehicle.make} {vehicle.model}
                  </td>
                  <td data-label="Year">{vehicle.year}</td>
                  <td data-label="Type">{vehicle.vehicleType}</td>
                  <td data-label="Location">{vehicle.location}</td>
                  <td data-label="Price/Day">${vehicle.pricePerDay} FJD</td>
                  <td data-label="Status">
                    <span className={`status-badge ${vehicle.status.toLowerCase()}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td data-label="Actions" className="table-actions">
                    <div className="action-buttons">
                      <button
                        onClick={() => {
                          setViewingVehicle(vehicle);
                          setCurrentImageIndex(0);
                        }}
                        className="action-btn view"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => navigate(`/manager/vehicles/edit/${vehicle.id}`)}
                        className="action-btn edit"
                        disabled={loading}
                        title="Edit Vehicle Details"
                      >
                        <Edit size={16} />
                      </button>



                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="action-btn delete"
                        disabled={loading}
                        title="Delete Vehicle"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {viewingVehicle && (
          <VehicleDetailModal
            vehicle={viewingVehicle}
            onClose={() => setViewingVehicle(null)}
          />
        )}
      </div>
    </div>
  );
};

export default VehicleManagementManager;