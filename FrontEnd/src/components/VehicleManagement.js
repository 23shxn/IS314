import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Layout, Users, Car, ClipboardList, ToolCase, Check, X, Plus, Trash2, Eye, ChevronLeft, ChevronRight, Edit, Calendar } from 'lucide-react';
import '../styles/VehicleManagement.css';

const VehicleManagement = ({ setCurrentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingVehicle, setViewingVehicle] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newVehicle, setNewVehicle] = useState({
    licensePlate: '',
    make: '',
    model: '',
    year: '',
    vehicleType: '',
    color: '',
    vin: '',
    fuelType: '',
    transmission: '',
    seatingCapacity: '',
    mileage: '',
    pricePerDay: '',
    location: '',
    description: '',
    features: '',
    vehicleImage1: null,
    vehicleImage2: null,
    vehicleImage3: null
  });
  const [formError, setFormError] = useState('');
  const [currentAdmin, setCurrentAdmin] = useState(null);

  useEffect(() => {
    console.log('VehicleManagement mounted, fetching vehicles...');
    fetchCurrentAdmin();
    fetchVehicles();
  }, []);

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
    return licensePlateRegex.test(licensePlate.trim());
  };

  const validateSeatingCapacity = (capacity) => {
    const numCapacity = parseInt(capacity);
    return !isNaN(numCapacity) && numCapacity >= 2 && numCapacity <= 50;
  };

  const validateVin = (vin) => {
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
    return priceNum > 0 && priceNum <= 10000;
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

    if (!vehicleData.color || vehicleData.color.trim() === '') {
      errors.color = 'Color is required';
    }

    return errors;
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

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicles/all`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      console.log('Fetch vehicles response:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Vehicles fetched:', data);
        setVehicles(Array.isArray(data) ? data : []);
        setError('');
      } else if (response.status === 401) {
        setError('Unauthorized: Please log in as admin');
      } else if (response.status === 403) {
        setError('Forbidden: Admin access required');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch vehicles');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Fetch vehicles error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();

    // Comprehensive validation
    const errors = validateForm(newVehicle);
    if (Object.keys(errors).length > 0) {
      setFormError(Object.values(errors).join('; '));
      return;
    }

    const formData = new FormData();
    formData.append('licensePlate', newVehicle.licensePlate);
    formData.append('make', newVehicle.make);
    formData.append('model', newVehicle.model);
    formData.append('year', newVehicle.year);
    formData.append('vehicleType', newVehicle.vehicleType);
    formData.append('color', newVehicle.color);
    formData.append('vin', newVehicle.vin);
    formData.append('fuelType', newVehicle.fuelType);
    formData.append('transmission', newVehicle.transmission);
    formData.append('seatingCapacity', newVehicle.seatingCapacity);
    formData.append('mileage', newVehicle.mileage);
    formData.append('pricePerDay', newVehicle.pricePerDay);
    formData.append('location', newVehicle.location);
    formData.append('description', newVehicle.description);
    formData.append('features', newVehicle.features);

    if (newVehicle.vehicleImage1) formData.append('vehicleImage1', newVehicle.vehicleImage1);
    if (newVehicle.vehicleImage2) formData.append('vehicleImage2', newVehicle.vehicleImage2);
    if (newVehicle.vehicleImage3) formData.append('vehicleImage3', newVehicle.vehicleImage3);

    setLoading(true);
    setFormError('');

    try {
      const endpoint = '/api/vehicles/pending/add';
      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        alert('Vehicle addition request submitted for approval');
        setShowAddForm(false);
        resetForm();
      } else {
        const errorData = await response.json();
        setFormError(errorData.error || 'Failed to submit vehicle addition request');
      }
    } catch (err) {
      setFormError('Failed to connect to the server');
      console.error('Add vehicle error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e, imageNumber) => {
    const file = e.target.files[0];
    if (file) {
      setNewVehicle(prev => ({
        ...prev,
        [`vehicleImage${imageNumber}`]: file
      }));
    }
  };

  const resetForm = () => {
    setNewVehicle({
      licensePlate: '',
      make: '',
      model: '',
      year: '',
      vehicleType: '',
      color: '',
      vin: '',
      fuelType: '',
      transmission: '',
      seatingCapacity: '',
      mileage: '',
      pricePerDay: '',
      location: '',
      description: '',
      features: '',
      vehicleImage1: null,
      vehicleImage2: null,
      vehicleImage3: null
    });
    setFormError('');
    setShowAddForm(false);
  };

  return (
    <div className="admin-dashboard">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Ronaldo's Rentals {isSuperAdmin() ? 'Super Admin' : 'Admin'} Dashboard</h2>
        </div>
        <div className="sidebar-menu">
          <button
            onClick={() => handleNavigation('dashboard')}
            className={`sidebar-btn ${location.pathname === `/${isSuperAdmin() ? 'manager' : 'admin'}/dashboard` ? 'active' : ''}`}
          >
            <Layout className="btn-icon" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => handleNavigation('vehicles')}
            className={`sidebar-btn ${location.pathname === `/${isSuperAdmin() ? 'manager' : 'admin'}/vehicles` ? 'active' : ''}`}
          >
            <Car className="btn-icon" />
            <span>Vehicle Management</span>
          </button>
          {isSuperAdmin() ? (
            <>
              <button
                onClick={() => handleNavigation('users')}
                className={`sidebar-btn ${location.pathname === '/manager/users' ? 'active' : ''}`}
              >
                <Users className="btn-icon" />
                <span>User Management</span>
              </button>
              <button
                onClick={() => handleNavigation('pending-requests')}
                className={`sidebar-btn ${location.pathname === '/manager/pending-requests' ? 'active' : ''}`}
              >
                <ClipboardList className="btn-icon" />
                <span>Pending User Requests</span>
              </button>
              <button
                onClick={() => handleNavigation('maintenance')}
                className={`sidebar-btn ${location.pathname === '/manager/maintenance' ? 'active' : ''}`}
              >
                <ToolCase className="btn-icon" />
                <span>Maintenance</span>
              </button>
              <button
                onClick={() => handleNavigation('reservations')}
                className={`sidebar-btn ${location.pathname === '/manager/reservations' ? 'active' : ''}`}
              >
                <Calendar className="btn-icon" />
                <span>Reservations</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavigation('pending-requests')}
                className={`sidebar-btn ${location.pathname === '/admin/pending-requests' ? 'active' : ''}`}
              >
                <ClipboardList className="btn-icon" />
                <span>Pending User Requests</span>
              </button>
              <button
                onClick={() => handleNavigation('users')}
                className={`sidebar-btn ${location.pathname === '/admin/users' ? 'active' : ''}`}
              >
                <Users className="btn-icon" />
                <span>Customer Information</span>
              </button>
              <button
                onClick={() => handleNavigation('maintenance')}
                className={`sidebar-btn ${location.pathname === '/admin/maintenance' ? 'active' : ''}`}
              >
                <ToolCase className="btn-icon" />
                <span>Maintenance</span>
              </button>
              <button
                onClick={() => handleNavigation('reservations')}
                className={`sidebar-btn ${location.pathname === '/admin/reservations' ? 'active' : ''}`}
              >
                <Calendar className="btn-icon" />
                <span>Reservations</span>
              </button>
            </>
          )}
        </div>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-btn logout">
            <LogOut className="btn-icon" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="main-content">
        <div className="vehicle-management">
          <div className="header">
            <h2>Vehicle Management</h2>
            <button onClick={() => setShowAddForm(true)} className="btn-primary">
              <Plus size={16} /> Add Vehicle
            </button>
          </div>

          {showAddForm && (
            <div className="form-container">
              <form onSubmit={handleAddVehicle}>
                <div className="form-group">
                  <label>License Plate *</label>
                  <input
                    type="text"
                    value={newVehicle.licensePlate}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                    placeholder="e.g., AB 123"
                    required
                    maxLength={10}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Make *</label>
                    <input
                      type="text"
                      value={newVehicle.make}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, make: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Model *</label>
                    <input
                      type="text"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, model: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Year *</label>
                    <input
                      type="number"
                      value={newVehicle.year}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, year: e.target.value }))}
                      min="1900"
                      max={new Date().getFullYear()}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Type *</label>
                    <select
                      value={newVehicle.vehicleType}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, vehicleType: e.target.value }))}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Truck">Truck</option>
                      <option value="Van">Van</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Color *</label>
                  <input
                    type="text"
                    value={newVehicle.color}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, color: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>VIN</label>
                  <input
                    type="text"
                    value={newVehicle.vin}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                    maxLength={17}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fuel Type *</label>
                    <select
                      value={newVehicle.fuelType}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, fuelType: e.target.value }))}
                      required
                    >
                      <option value="">Select Fuel</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Transmission *</label>
                    <select
                      value={newVehicle.transmission}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, transmission: e.target.value }))}
                      required
                    >
                      <option value="">Select Transmission</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Seating Capacity *</label>
                    <input
                      type="number"
                      value={newVehicle.seatingCapacity}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, seatingCapacity: e.target.value }))}
                      min="2"
                      max="50"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mileage (km)</label>
                    <input
                      type="number"
                      value={newVehicle.mileage}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, mileage: e.target.value }))}
                      min="0"
                      max="500000"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price Per Day (FJD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newVehicle.pricePerDay}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, pricePerDay: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Location *</label>
                    <select
                      value={newVehicle.location}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, location: e.target.value }))}
                      required
                    >
                      <option value="">Select Location</option>
                      <option value="Suva">Suva</option>
                      <option value="Nadi">Nadi</option>
                      <option value="Lautoka">Lautoka</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newVehicle.description}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Features</label>
                  <textarea
                    value={newVehicle.features}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, features: e.target.value }))}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Vehicle Images (Optional)</label>
                  <div className="image-uploads">
                    <div className="image-upload">
                      <label htmlFor="vehicleImage1">Image 1</label>
                      <input
                        type="file"
                        id="vehicleImage1"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 1)}
                      />
                    </div>
                    <div className="image-upload">
                      <label htmlFor="vehicleImage2">Image 2</label>
                      <input
                        type="file"
                        id="vehicleImage2"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 2)}
                      />
                    </div>
                    <div className="image-upload">
                      <label htmlFor="vehicleImage3">Image 3</label>
                      <input
                        type="file"
                        id="vehicleImage3"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 3)}
                      />
                    </div>
                  </div>
                </div>
                {formError && <div className="error-message">{formError}</div>}

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Processing...' : 'Submit for Approval'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {loading && <div className="loading-message">Loading...</div>}

          {!loading && vehicles.length === 0 && !error && (
            <div className="no-data-message">
              <p>No vehicles found.</p>
            </div>
          )}

          {vehicles.length > 0 && (
            <div className="table-container">
              <table className="vehicles-table">
                <thead>
                  <tr>
                    <th>License Plate</th>
                    <th>Make</th>
                    <th>Model</th>
                    <th>Year</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Price/Day</th>
                    <th>Location</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td data-label="License Plate">{vehicle.licensePlate}</td>
                      <td data-label="Make">{vehicle.make}</td>
                      <td data-label="Model">{vehicle.model}</td>
                      <td data-label="Year">{vehicle.year}</td>
                      <td data-label="Type">{vehicle.vehicleType}</td>
                      <td data-label="Status">
                        <span className={`status-badge ${vehicle.status.toLowerCase()}`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td data-label="Price/Day">${vehicle.pricePerDay}</td>
                      <td data-label="Location">{vehicle.location}</td>
                      <td data-label="Details">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewingVehicle && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{viewingVehicle.make} {viewingVehicle.model}</h3>
                  <button onClick={() => setViewingVehicle(null)} className="close-btn">
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="image-carousel">
                    {viewingVehicle.vehicleImages && viewingVehicle.vehicleImages.map((img, index) => (
                      <img
                        key={index}
                        src={`data:image/jpeg;base64,${img.imageData}`}
                        alt={`Vehicle image ${index + 1}`}
                        style={{ display: index === currentImageIndex ? 'block' : 'none' }}
                      />
                    ))}
                    {viewingVehicle.vehicleImages && viewingVehicle.vehicleImages.length > 1 && (
                      <>
                        <button onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}>
                          <ChevronLeft />
                        </button>
                        <button onClick={() => setCurrentImageIndex(prev => Math.min(viewingVehicle.vehicleImages.length - 1, prev + 1))}>
                          <ChevronRight />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="vehicle-details">
                    <p><strong>License Plate:</strong> {viewingVehicle.licensePlate}</p>
                    <p><strong>Year:</strong> {viewingVehicle.year}</p>
                    <p><strong>Color:</strong> {viewingVehicle.color}</p>
                    <p><strong>VIN:</strong> {viewingVehicle.vin}</p>
                    <p><strong>Fuel Type:</strong> {viewingVehicle.fuelType}</p>
                    <p><strong>Transmission:</strong> {viewingVehicle.transmission}</p>
                    <p><strong>Seating Capacity:</strong> {viewingVehicle.seatingCapacity}</p>
                    <p><strong>Mileage:</strong> {viewingVehicle.mileage}</p>
                    <p><strong>Price Per Day:</strong> ${viewingVehicle.pricePerDay}</p>
                    <p><strong>Location:</strong> {viewingVehicle.location}</p>
                    <p><strong>Description:</strong> {viewingVehicle.description}</p>
                    <p><strong>Features:</strong> {viewingVehicle.features}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleManagement;