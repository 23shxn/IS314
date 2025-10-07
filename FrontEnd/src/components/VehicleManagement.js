import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Layout, Users, Car, ClipboardList, ToolCase, Check, X, Plus, Trash2, Eye, ChevronLeft, ChevronRight, Edit } from 'lucide-react';
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
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    console.log('VehicleManagement mounted, fetching vehicles...');
    fetchVehicles();
  }, []);

  // Validation functions
  const validateLicensePlate = (licensePlate) => {
    // Format: AB 123 (two letters, space, three numbers)
    const licensePlateRegex = /^[A-Za-z]{2}\s\d{3}$/;
    return licensePlateRegex.test(licensePlate.trim());
  };

  const validateSeatingCapacity = (capacity) => {
    const numCapacity = parseInt(capacity);
    return !isNaN(numCapacity) && numCapacity >= 2;
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', {
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
    navigate(`/admin/${path}`);
  };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/vehicles/all', {
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

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      return;
    }
    
    setError('');
    setLoading(true);
    console.log('Deleting vehicle ID:', id);

    try {
      const response = await fetch(`http://localhost:8080/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      console.log('Delete vehicle response:', response.status);
      if (response.ok) {
        setVehicles(vehicles.filter(v => v.id !== id));
        setError('');
        console.log('Vehicle deleted successfully');
      } else if (response.status === 401) {
        setError('Unauthorized: Please log in as admin');
      } else if (response.status === 403) {
        setError('Forbidden: Admin access required');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete vehicle');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Delete vehicle error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setError('');
    setLoading(true);
    console.log('Updating vehicle status:', id, newStatus);

    try {
      const response = await fetch(`http://localhost:8080/api/vehicles/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      console.log('Update status response:', response.status);
      if (response.ok) {
        const updatedVehicle = await response.json();
        setVehicles(vehicles.map(v => v.id === id ? updatedVehicle : v));
        setError('');
      } else if (response.status === 401) {
        setError('Unauthorized: Please log in as admin');
      } else if (response.status === 403) {
        setError('Forbidden: Admin access required');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update vehicle status');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Update status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Real-time validation feedback
    if (name === 'licensePlate') {
      // Format the license plate as user types
      let formattedValue = value.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
      
      // Add space after two letters if not present
      if (formattedValue.length === 3 && formattedValue[2] !== ' ') {
        formattedValue = formattedValue.substring(0, 2) + ' ' + formattedValue.substring(2);
      }
      
      // Limit to AB 123 format
      if (formattedValue.length > 6) {
        formattedValue = formattedValue.substring(0, 6);
      }
      
      setNewVehicle({ ...newVehicle, [name]: formattedValue });
    } else if (name === 'seatingCapacity') {
      // Only allow positive numbers
      const numValue = parseInt(value);
      if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
        setNewVehicle({ ...newVehicle, [name]: value });
      }
    } else {
      setNewVehicle({ ...newVehicle, [name]: value });
    }
  };

  const handleImageChange = (e, imageNumber) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormError(`Image ${imageNumber} must be a valid image file (JPEG, PNG, GIF, WebP)`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setFormError(`Image ${imageNumber} must be smaller than 10MB`);
        return;
      }
      setNewVehicle({ ...newVehicle, [`vehicleImage${imageNumber}`]: file });
      setFormError(''); // Clear error if file is valid
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    // Validate license plate format
    if (!validateLicensePlate(newVehicle.licensePlate)) {
      setFormError('License plate must be in format: AB 123 (2 letters, space, 3 numbers)');
      setLoading(false);
      return;
    }

    // Validate seating capacity
    if (!validateSeatingCapacity(newVehicle.seatingCapacity)) {
      setFormError('Seating capacity must be at least 2');
      setLoading(false);
      return;
    }

    const requiredFields = [
      'licensePlate', 'make', 'model', 'year', 'vehicleType', 'color',
      'fuelType', 'transmission', 'seatingCapacity', 'pricePerDay', 'location'
    ];
    const missingFields = requiredFields.filter(field => !newVehicle[field] || newVehicle[field].toString().trim() === '');
    if (missingFields.length > 0) {
      setFormError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    // Check that all three images are provided
    if (!newVehicle.vehicleImage1 || !newVehicle.vehicleImage2 || !newVehicle.vehicleImage3) {
      setFormError('All three vehicle images are required');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('licensePlate', newVehicle.licensePlate);
      formData.append('make', newVehicle.make);
      formData.append('model', newVehicle.model);
      formData.append('year', newVehicle.year);
      formData.append('vehicleType', newVehicle.vehicleType);
      formData.append('color', newVehicle.color);
      formData.append('fuelType', newVehicle.fuelType);
      formData.append('transmission', newVehicle.transmission);
      formData.append('seatingCapacity', newVehicle.seatingCapacity);
      formData.append('pricePerDay', newVehicle.pricePerDay);
      formData.append('location', newVehicle.location);
      if (newVehicle.vin) formData.append('vin', newVehicle.vin);
      if (newVehicle.mileage) formData.append('mileage', newVehicle.mileage);
      if (newVehicle.description) formData.append('description', newVehicle.description);
      if (newVehicle.features) formData.append('features', newVehicle.features);
      
      // Append all three images
      formData.append('vehicleImage1', newVehicle.vehicleImage1);
      formData.append('vehicleImage2', newVehicle.vehicleImage2);
      formData.append('vehicleImage3', newVehicle.vehicleImage3);

      const response = await fetch('http://localhost:8080/api/vehicles/add', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      console.log('Add vehicle response:', response.status);
      if (response.ok) {
        setNewVehicle({
          licensePlate: '', make: '', model: '', year: '', vehicleType: '',
          color: '', vin: '', fuelType: '', transmission: '', seatingCapacity: '',
          mileage: '', pricePerDay: '', location: '', description: '', features: '',
          vehicleImage1: null, vehicleImage2: null, vehicleImage3: null
        });
        document.getElementById('vehicleImage1').value = '';
        document.getElementById('vehicleImage2').value = '';
        document.getElementById('vehicleImage3').value = '';
        setShowAddForm(false);
        fetchVehicles();
        setError('');
      } else if (response.status === 401) {
        setFormError('Unauthorized: Please log in as admin');
      } else if (response.status === 403) {
        setFormError('Forbidden: Admin access required');
      } else {
        const errorData = await response.json();
        setFormError(errorData.error || 'Failed to add vehicle');
      }
    } catch (err) {
      setFormError('Failed to connect to the server');
      console.error('Add vehicle error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setNewVehicle({
      licensePlate: vehicle.licensePlate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      vehicleType: vehicle.vehicleType,
      color: vehicle.color,
      vin: vehicle.vin || '',
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      seatingCapacity: vehicle.seatingCapacity.toString(),
      mileage: vehicle.mileage?.toString() || '',
      pricePerDay: vehicle.pricePerDay.toString(),
      location: vehicle.location,
      description: vehicle.description || '',
      features: vehicle.features || '',
      vehicleImage1: null,
      vehicleImage2: null,
      vehicleImage3: null
    });
    setShowEditForm(true);
    setShowAddForm(false);
    setFormError('');
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    // Validation
    if (!validateLicensePlate(newVehicle.licensePlate)) {
      setFormError('License plate must be in format: AB 123 (2 letters, space, 3 numbers)');
      setLoading(false);
      return;
    }

    if (!validateSeatingCapacity(newVehicle.seatingCapacity)) {
      setFormError('Seating capacity must be at least 2');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      
      // Add all text fields
      if (newVehicle.licensePlate) formData.append('licensePlate', newVehicle.licensePlate);
      if (newVehicle.make) formData.append('make', newVehicle.make);
      if (newVehicle.model) formData.append('model', newVehicle.model);
      if (newVehicle.year) formData.append('year', newVehicle.year);
      if (newVehicle.vehicleType) formData.append('vehicleType', newVehicle.vehicleType);
      if (newVehicle.color) formData.append('color', newVehicle.color);
      if (newVehicle.vin) formData.append('vin', newVehicle.vin);
      if (newVehicle.fuelType) formData.append('fuelType', newVehicle.fuelType);
      if (newVehicle.transmission) formData.append('transmission', newVehicle.transmission);
      if (newVehicle.seatingCapacity) formData.append('seatingCapacity', newVehicle.seatingCapacity);
      if (newVehicle.mileage) formData.append('mileage', newVehicle.mileage);
      if (newVehicle.pricePerDay) formData.append('pricePerDay', newVehicle.pricePerDay);
      if (newVehicle.location) formData.append('location', newVehicle.location);
      if (newVehicle.description) formData.append('description', newVehicle.description);
      if (newVehicle.features) formData.append('features', newVehicle.features);
      
      // Add image files only if selected
      if (newVehicle.vehicleImage1) formData.append('vehicleImage1', newVehicle.vehicleImage1);
      if (newVehicle.vehicleImage2) formData.append('vehicleImage2', newVehicle.vehicleImage2);
      if (newVehicle.vehicleImage3) formData.append('vehicleImage3', newVehicle.vehicleImage3);

      const response = await fetch(`http://localhost:8080/api/vehicles/${editingVehicle.id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
        // Don't set Content-Type header - let browser set it automatically
      });

      if (response.ok) {
        const result = await response.json();
        setShowEditForm(false);
        setEditingVehicle(null);
        fetchVehicles(); // Refresh the vehicles list
        setFormError('');
        
        // Reset form
        setNewVehicle({
          licensePlate: '', make: '', model: '', year: '', vehicleType: '',
          color: '', vin: '', fuelType: '', transmission: '', seatingCapacity: '',
          mileage: '', pricePerDay: '', location: '', description: '', features: '',
          vehicleImage1: null, vehicleImage2: null, vehicleImage3: null
        });
        
        alert('Vehicle updated successfully!');
      } else {
        const errorData = await response.json();
        setFormError(errorData.error || 'Failed to update vehicle');
      }
    } catch (err) {
      setFormError('Failed to connect to the server');
      console.error('Update vehicle error:', err);
    } finally {
      setLoading(false);
    }
  };

  const VehicleDetailModal = ({ vehicle, onClose }) => {
    if (!vehicle) return null;
    
    const vehicleImages = [
      vehicle.vehicleImage1,
      vehicle.vehicleImage2,
      vehicle.vehicleImage3
    ].filter(img => img); // Filter out null/empty images

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
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Ronaldo's Rentals Admin Dashboard</h2>
        </div>
        <div className="sidebar-menu">
          <button 
            onClick={() => handleNavigation('dashboard')} 
            className={`sidebar-btn ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
          >
            <Layout className="btn-icon" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => handleNavigation('vehicles')} 
            className={`sidebar-btn ${location.pathname === '/admin/vehicles' ? 'active' : ''}`}
          >
            <Car className="btn-icon" />
            <span>Vehicle Management</span>
          </button>
          <button 
            onClick={() => handleNavigation('pending-requests')} 
            className={`sidebar-btn ${location.pathname === '/admin/pending-requests' ? 'active' : ''}`}
          >
            <ClipboardList className="btn-icon" />
            <span>Pending Requests</span>
          </button>
          <button 
            onClick={() => handleNavigation('users')} 
            className={`sidebar-btn ${location.pathname === '/admin/users' ? 'active' : ''}`}
          >
            <Users className="btn-icon" />
            <span>User Management</span>
          </button>
          <button 
            onClick={() => handleNavigation('maintenance')} 
            className={`sidebar-btn ${location.pathname === '/admin/maintenance' ? 'active' : ''}`}
          >
            <ToolCase className="btn-icon" />
            <span>Maintenance</span>
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
        <div className="vehicle-management">
          <div className="management-header">
            <h2>Vehicle Management</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              <Plus className="btn-icon" />
              Add Vehicle
            </button>
          </div>

          {(showAddForm || showEditForm) && (
            <div className="card add-vehicle-form">
              <h3>{showEditForm ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
              {formError && <p className="error-text">{formError}</p>}
              <form onSubmit={showEditForm ? handleUpdateVehicle : handleAddVehicle} encType="multipart/form-data">
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="licensePlate">License Plate *</label>
                    <input
                      type="text"
                      id="licensePlate"
                      name="licensePlate"
                      value={newVehicle.licensePlate}
                      onChange={handleInputChange}
                      placeholder="AB 123"
                      required
                      className={!validateLicensePlate(newVehicle.licensePlate) && newVehicle.licensePlate ? 'invalid' : ''}
                    />
                    {!validateLicensePlate(newVehicle.licensePlate) && newVehicle.licensePlate && (
                      <small className="field-error">Format: AB 123 (2 letters, space, 3 numbers)</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="make">Make *</label>
                    <input
                      type="text"
                      id="make"
                      name="make"
                      value={newVehicle.make}
                      onChange={handleInputChange}
                      placeholder="Toyota"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="model">Model *</label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      value={newVehicle.model}
                      onChange={handleInputChange}
                      placeholder="Camry"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="year">Year *</label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      value={newVehicle.year}
                      onChange={handleInputChange}
                      placeholder="2023"
                      min="1980"
                      max="2025"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="vehicleType">Vehicle Type *</label>
                    <select
                      id="vehicleType"
                      name="vehicleType"
                      value={newVehicle.vehicleType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Truck">Truck</option>
                      <option value="Convertible">Convertible</option>
                      <option value="Coupe">Coupe</option>
                      <option value="Wagon">Wagon</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="color">Color *</label>
                    <input
                      type="text"
                      id="color"
                      name="color"
                      value={newVehicle.color}
                      onChange={handleInputChange}
                      placeholder="White"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="vin">VIN</label>
                    <input
                      type="text"
                      id="vin"
                      name="vin"
                      value={newVehicle.vin}
                      onChange={handleInputChange}
                      placeholder="1HGBH41JXMN109186"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="fuelType">Fuel Type *</label>
                    <select
                      id="fuelType"
                      name="fuelType"
                      value={newVehicle.fuelType}
                      onChange={handleInputChange}
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
                    <label htmlFor="transmission">Transmission *</label>
                    <select
                      id="transmission"
                      name="transmission"
                      value={newVehicle.transmission}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Transmission</option>
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                      <option value="CVT">CVT</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="seatingCapacity">Seating Capacity *</label>
                    <input
                      type="number"
                      id="seatingCapacity"
                      name="seatingCapacity"
                      value={newVehicle.seatingCapacity}
                      onChange={handleInputChange}
                      placeholder="5"
                      min="2"
                      max="12"
                      required
                      className={!validateSeatingCapacity(newVehicle.seatingCapacity) && newVehicle.seatingCapacity ? 'invalid' : ''}
                    />
                    {!validateSeatingCapacity(newVehicle.seatingCapacity) && newVehicle.seatingCapacity && (
                      <small className="field-error">Must be at least 2</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="mileage">Mileage (km)</label>
                    <input
                      type="number"
                      id="mileage"
                      name="mileage"
                      value={newVehicle.mileage}
                      onChange={handleInputChange}
                      placeholder="50000"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="pricePerDay">Price Per Day (FJD) *</label>
                    <input
                      type="number"
                      id="pricePerDay"
                      name="pricePerDay"
                      value={newVehicle.pricePerDay}
                      onChange={handleInputChange}
                      placeholder="80.00"
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">Location *</label>
                    <select
                      id="location"
                      name="location"
                      value={newVehicle.location}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Location</option>
                      <option value="Suva">Suva</option>
                      <option value="Nadi">Nadi</option>
                      <option value="Lautoka">Lautoka</option>
                      <option value="Labasa">Labasa</option>
                      <option value="Ba">Ba</option>
                      <option value="Sigatoka">Sigatoka</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={newVehicle.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of the vehicle..."
                      rows="3"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="features">Features</label>
                    <textarea
                      id="features"
                      name="features"
                      value={newVehicle.features}
                      onChange={handleInputChange}
                      placeholder="Air conditioning, GPS, Bluetooth, etc."
                      rows="2"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="vehicleImage1">Vehicle Image 1 {!showEditForm && '*'}</label>
                    <input
                      type="file"
                      id="vehicleImage1"
                      name="vehicleImage1"
                      onChange={(e) => handleImageChange(e, 1)}
                      accept="image/*"
                      required={!showEditForm}
                    />
                    {showEditForm && <small>Leave empty to keep current image</small>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="vehicleImage2">Vehicle Image 2 {!showEditForm && '*'}</label>
                    <input
                      type="file"
                      id="vehicleImage2"
                      name="vehicleImage2"
                      onChange={(e) => handleImageChange(e, 2)}
                      accept="image/*"
                      required={!showEditForm}
                    />
                    {showEditForm && <small>Leave empty to keep current image</small>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="vehicleImage3">Vehicle Image 3 {!showEditForm && '*'}</label>
                    <input
                      type="file"
                      id="vehicleImage3"
                      name="vehicleImage3"
                      onChange={(e) => handleImageChange(e, 3)}
                      accept="image/*"
                      required={!showEditForm}
                    />
                    {showEditForm && <small>Leave empty to keep current image</small>}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? (showEditForm ? 'Updating...' : 'Adding...') : (showEditForm ? 'Update Vehicle' : 'Add Vehicle')}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => {
                      setShowAddForm(false);
                      setShowEditForm(false);
                      setEditingVehicle(null);
                      setFormError('');
                      // Reset form
                      setNewVehicle({
                        licensePlate: '', make: '', model: '', year: '', vehicleType: '',
                        color: '', vin: '', fuelType: '', transmission: '', seatingCapacity: '',
                        mileage: '', pricePerDay: '', location: '', description: '', features: '',
                        vehicleImage1: null, vehicleImage2: null, vehicleImage3: null
                      });
                    }}
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
                    <th>Actions</th>
                    <th>Edit</th> {/* New column */}
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
                      <td data-label="Actions" className="table-actions">
                        <div className="actions-container">
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
                          
                          <select
                            value={vehicle.status}
                            onChange={(e) => handleStatusUpdate(vehicle.id, e.target.value)}
                            className="status-select"
                            disabled={loading}
                            title="Change Status"
                          >
                            <option value="Available">Available</option>
                            <option value="Rented">Rented</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Out_of_Service">Out of Service</option>
                          </select>
                          
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
                      {/* Alternative edit button with more prominent styling */}
                      <td data-label="Edit" className="table-edit">
                        <button
                          onClick={() => handleEditVehicle(vehicle)}
                          className="edit-btn-primary"
                          disabled={loading}
                          title="Edit Vehicle Details"
                        >
                          <Edit size={16} />
                          Edit Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewingVehicle && (
            <VehicleDetailModal 
              vehicle={viewingVehicle} 
              onClose={() => setViewingVehicle(null)} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleManagement;