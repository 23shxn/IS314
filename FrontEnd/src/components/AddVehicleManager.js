import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Layout, Users, Car, ClipboardList, ToolCase, Check, X, Calendar } from 'lucide-react';
import '../styles/AdminDashboard.css';
import '../styles/AddVehicle.css';

const AddVehicleManager = ({ setCurrentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentAdmin, setCurrentAdmin] = useState(null);
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
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrentAdmin();
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

  // Validation functions
  const validateLicensePlate = (licensePlate) => {
    const licensePlateRegex = /^[A-Za-z]{2}\s\d{3}$/;
    return licensePlateRegex.test(licensePlate);
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

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');

    const errors = validateForm(newVehicle);
    if (Object.keys(errors).length > 0) {
      setFormError(Object.values(errors).join('; '));
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('licensePlate', newVehicle.licensePlate);
      formData.append('make', newVehicle.make);
      formData.append('model', newVehicle.model);
      formData.append('year', newVehicle.year);
      formData.append('vehicleType', newVehicle.vehicleType);
      formData.append('color', newVehicle.color);
      formData.append('vin', newVehicle.vin || '');
      formData.append('fuelType', newVehicle.fuelType);
      formData.append('transmission', newVehicle.transmission);
      formData.append('seatingCapacity', newVehicle.seatingCapacity);
      formData.append('mileage', newVehicle.mileage || '');
      formData.append('pricePerDay', newVehicle.pricePerDay);
      formData.append('location', newVehicle.location);
      formData.append('description', newVehicle.description || '');
      formData.append('features', newVehicle.features || '');
      if (newVehicle.vehicleImage1) formData.append('vehicleImage1', newVehicle.vehicleImage1);
      if (newVehicle.vehicleImage2) formData.append('vehicleImage2', newVehicle.vehicleImage2);
      if (newVehicle.vehicleImage3) formData.append('vehicleImage3', newVehicle.vehicleImage3);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicles/add`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess('Vehicle added successfully!');
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
        setTimeout(() => {
          navigate('/manager/vehicles');
        }, 2000);
      } else {
        const errorData = await response.json();
        setFormError(errorData.error || 'Failed to add vehicle');
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      setFormError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/manager/vehicles');
  };

  const handleBackToVehicles = () => {
    navigate('/manager/vehicles');
  };

  const handleInputChange = (field, value) => {
    setNewVehicle(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (field, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }
    setNewVehicle(prev => ({ ...prev, [field]: file }));
  };

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
          <button
            onClick={handleBackToVehicles}
            className="back-button"
          >
            <Car size={20} />
            Back to Vehicle Management
          </button>
          <h1>Add New Vehicle</h1>
        </div>

        <div className="add-vehicle-content">
          <div className="form-container">
            <div className="form-header">
              <Car size={32} className="form-icon" />
              <h2>Add New Vehicle</h2>
              <p>Fill in the details below to add a new vehicle to the fleet</p>
            </div>

            {formError && (
              <div className="alert alert-error">
                <X size={20} />
                {formError}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <Check size={20} />
                {success}
              </div>
            )}

            <form onSubmit={handleAddVehicle} className="vehicle-form">
            <div className="form-grid">
              <div className="form-group">
                <label>License Plate *</label>
                <input
                  type="text"
                  value={newVehicle.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
                  placeholder="AB 123"
                  required
                  maxLength={10}
                />
              </div>
              <div className="form-group">
                <label>Make *</label>
                <input
                  type="text"
                  value={newVehicle.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  placeholder="Toyota"
                  required
                />
              </div>
              <div className="form-group">
                <label>Model *</label>
                <input
                  type="text"
                  value={newVehicle.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="Camry"
                  required
                />
              </div>
              <div className="form-group">
                <label>Year *</label>
                <input
                  type="number"
                  value={newVehicle.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  min="1900"
                  max={new Date().getFullYear()}
                  required
                />
              </div>
              <div className="form-group">
                <label>Vehicle Type *</label>
                <select
                  value={newVehicle.vehicleType}
                  onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                </select>
              </div>
              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  value={newVehicle.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="Blue"
                />
              </div>
              <div className="form-group">
                <label>VIN</label>
                <input
                  type="text"
                  value={newVehicle.vin}
                  onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                  placeholder="1HGCM82633A004352"
                  maxLength={17}
                />
              </div>
              <div className="form-group">
                <label>Fuel Type *</label>
                <select
                  value={newVehicle.fuelType}
                  onChange={(e) => handleInputChange('fuelType', e.target.value)}
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
                  onChange={(e) => handleInputChange('transmission', e.target.value)}
                  required
                >
                  <option value="">Select Transmission</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
              <div className="form-group">
                <label>Seating Capacity *</label>
                <input
                  type="number"
                  value={newVehicle.seatingCapacity}
                  onChange={(e) => handleInputChange('seatingCapacity', e.target.value)}
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
                  onChange={(e) => handleInputChange('mileage', e.target.value)}
                  min="0"
                  max="500000"
                />
              </div>
              <div className="form-group">
                <label>Price per Day (FJD) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newVehicle.pricePerDay}
                  onChange={(e) => handleInputChange('pricePerDay', e.target.value)}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <select
                  value={newVehicle.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                >
                  <option value="">Select Location</option>
                  <option value="Suva">Suva</option>
                  <option value="Nadi">Nadi</option>
                  <option value="Lautoka">Lautoka</option>
                </select>
              </div>
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={newVehicle.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Vehicle description..."
                rows={3}
              />
            </div>
            <div className="form-group full-width">
              <label>Features</label>
              <textarea
                value={newVehicle.features}
                onChange={(e) => handleInputChange('features', e.target.value)}
                placeholder="Key features (comma-separated)..."
                rows={3}
              />
            </div>
            <div className="images-section">
              <h4>Vehicle Images *</h4>
              <div className="image-upload-group">
                <label>Image 1 *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange('vehicleImage1', e.target.files[0])}
                  required
                />
                {newVehicle.vehicleImage1 && newVehicle.vehicleImage1.name && (
                  <p>Selected: {newVehicle.vehicleImage1.name}</p>
                )}
              </div>
              <div className="image-upload-group">
                <label>Image 2 *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange('vehicleImage2', e.target.files[0])}
                  required
                />
                {newVehicle.vehicleImage2 && newVehicle.vehicleImage2.name && (
                  <p>Selected: {newVehicle.vehicleImage2.name}</p>
                )}
              </div>
              <div className="image-upload-group">
                <label>Image 3 *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange('vehicleImage3', e.target.files[0])}
                  required
                />
                {newVehicle.vehicleImage3 && newVehicle.vehicleImage3.name && (
                  <p>Selected: {newVehicle.vehicleImage3.name}</p>
                )}
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Submit Vehicle Request '}
              </button>
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVehicleManager;
