import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { LogOut, Layout, Users, Car, ClipboardList, ToolCase, Check, X, Plus, Trash2, Eye, ChevronLeft, ChevronRight, Edit, Calendar, ArrowLeft } from 'lucide-react';
import '../styles/VehicleManagement.css';

const EditVehicleManager = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchCurrentAdmin();
    if (id) {
      fetchVehicle();
    }
  }, [id]);

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

  const fetchVehicle = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicles/${id}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const vehicleData = await response.json();
        setVehicle(vehicleData);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch vehicle');
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
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

  const handleInputChange = (field, value) => {
    setVehicle(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (field, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }
    setVehicle(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const errors = validateForm(vehicle);
    if (Object.keys(errors).length > 0) {
      setFormError(Object.values(errors).join('; '));
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', vehicle.id);
      formData.append('licensePlate', vehicle.licensePlate);
      formData.append('make', vehicle.make);
      formData.append('model', vehicle.model);
      formData.append('year', vehicle.year);
      formData.append('vehicleType', vehicle.vehicleType);
      formData.append('color', vehicle.color);
      formData.append('vin', vehicle.vin || '');
      formData.append('fuelType', vehicle.fuelType);
      formData.append('transmission', vehicle.transmission);
      formData.append('seatingCapacity', vehicle.seatingCapacity);
      formData.append('mileage', vehicle.mileage || '');
      formData.append('pricePerDay', vehicle.pricePerDay);
      formData.append('location', vehicle.location);
      formData.append('description', vehicle.description || '');
      formData.append('features', vehicle.features || '');
      if (vehicle.vehicleImage1 instanceof File) formData.append('vehicleImage1', vehicle.vehicleImage1);
      if (vehicle.vehicleImage2 instanceof File) formData.append('vehicleImage2', vehicle.vehicleImage2);
      if (vehicle.vehicleImage3 instanceof File) formData.append('vehicleImage3', vehicle.vehicleImage3);


      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        alert('Vehicle updated successfully');
        navigate('/manager/vehicles');
      } else {
        const errorData = await response.json();
        setFormError(errorData.error || 'Failed to update vehicle');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      setFormError('Failed to connect to server');
    } finally {
      setLoading(false);
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
    navigate('/admin/login');
  };

  const isSuperAdmin = () => {
    return currentAdmin && currentAdmin.role === 'SUPER_ADMIN';
  };

  const handleNavigation = (path) => {
    if (isSuperAdmin()) {
      navigate(`/manager/${path}`);
    } else {
      navigate(`/admin/${path}`);
    }
  };

  if (loading && !vehicle) {
    return (
      <div className="vehicle-management">
        <div className="loading">Loading vehicle...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vehicle-management">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/manager/vehicles')} className="btn-secondary">
          <ArrowLeft size={20} /> Back to Vehicles
        </button>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="vehicle-management">
        <div className="error-message">Vehicle not found</div>
        <button onClick={() => navigate('/manager/vehicles')} className="btn-secondary">
          <ArrowLeft size={20} /> Back to Vehicles
        </button>
      </div>
    );
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
          <div className="header-with-back">
            <button
              onClick={() => navigate('/manager/vehicles')}
              className="back-btn"
            >
              <ArrowLeft size={20} />
              Back to Vehicles
            </button>
            <h1>Edit Vehicle</h1>
          </div>
          {formError && <div className="form-error">{formError}</div>}
        </div>

        <div className="add-vehicle-form">
          <form onSubmit={handleSubmit} className="vehicle-form">
            <div className="form-grid">
              <div className="form-group">
                <label>License Plate *</label>
                <input
                  type="text"
                  value={vehicle.licensePlate || ''}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
                  placeholder="AB 123"
                  required
                />
              </div>

              <div className="form-group">
                <label>Make *</label>
                <input
                  type="text"
                  value={vehicle.make || ''}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  placeholder="Toyota"
                  required
                />
              </div>

              <div className="form-group">
                <label>Model *</label>
                <input
                  type="text"
                  value={vehicle.model || ''}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="Camry"
                  required
                />
              </div>

              <div className="form-group">
                <label>Year *</label>
                <input
                  type="number"
                  value={vehicle.year || ''}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear()}
                  required
                />
              </div>

              <div className="form-group">
                <label>Vehicle Type *</label>
                <select
                  value={vehicle.vehicleType || ''}
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
                <label>Color *</label>
                <input
                  type="text"
                  value={vehicle.color || ''}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="White"
                  required
                />
              </div>

              <div className="form-group">
                <label>VIN</label>
                <input
                  type="text"
                  value={vehicle.vin || ''}
                  onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                  placeholder="17-character VIN"
                  maxLength="17"
                />
              </div>

              <div className="form-group">
                <label>Fuel Type *</label>
                <select
                  value={vehicle.fuelType || ''}
                  onChange={(e) => handleInputChange('fuelType', e.target.value)}
                  required
                >
                  <option value="">Select Fuel Type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="form-group">
                <label>Transmission *</label>
                <select
                  value={vehicle.transmission || ''}
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
                  value={vehicle.seatingCapacity || ''}
                  onChange={(e) => handleInputChange('seatingCapacity', e.target.value)}
                  placeholder="5"
                  min="2"
                  max="50"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mileage</label>
                <input
                  type="number"
                  value={vehicle.mileage || ''}
                  onChange={(e) => handleInputChange('mileage', e.target.value)}
                  placeholder="50000"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Price per Day (FJD) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={vehicle.pricePerDay || ''}
                  onChange={(e) => handleInputChange('pricePerDay', e.target.value)}
                  placeholder="50.00"
                  min="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Location *</label>
                <select
                  value={vehicle.location || ''}
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
                value={vehicle.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Optional vehicle description"
                rows={3}
              />
            </div>

            <div className="form-group full-width">
              <label>Features</label>
              <textarea
                value={vehicle.features || ''}
                onChange={(e) => handleInputChange('features', e.target.value)}
                placeholder="Optional vehicle features (comma-separated)"
                rows={3}
              />
            </div>

            <div className="images-section">
              <h4>Vehicle Images (Optional - leave empty to keep current images)</h4>
              <div className="image-upload-group">
                <label>Image 1</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange('vehicleImage1', e.target.files[0])}
                />
                {vehicle.vehicleImage1 && vehicle.vehicleImage1.name && (
                  <p>Selected: {vehicle.vehicleImage1.name}</p>
                )}
              </div>
              <div className="image-upload-group">
                <label>Image 2</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange('vehicleImage2', e.target.files[0])}
                />
                {vehicle.vehicleImage2 && vehicle.vehicleImage2.name && (
                  <p>Selected: {vehicle.vehicleImage2.name}</p>
                )}
              </div>
              <div className="image-upload-group">
                <label>Image 3</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange('vehicleImage3', e.target.files[0])}
                />
                {vehicle.vehicleImage3 && vehicle.vehicleImage3.name && (
                  <p>Selected: {vehicle.vehicleImage3.name}</p>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate('/manager/vehicles')} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Vehicle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditVehicleManager;
