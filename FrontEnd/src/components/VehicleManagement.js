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
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);


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
      const response = await fetch('http://localhost:8080/api/admin/current', {
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
    if (isSuperAdmin()) {
      navigate(`/manager/${path}`);
    } else {
      navigate(`/admin/${path}`);
    }
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

  const fetchPendingRequests = async () => {
    if (!isSuperAdmin()) return;

    try {
      const response = await fetch('http://localhost:8080/api/vehicles/pending/all', {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
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
        const result = await response.json();
        if (result.message && result.message.includes('submitted for approval')) {
          alert('Vehicle delete request submitted for approval');
        } else {
          setVehicles(vehicles.filter(v => v.id !== id));
        }
        setError('');
        console.log('Vehicle delete request processed successfully');
      } else if (response.status === 401) {
        setError('Unauthorized: Please log in as admin');
      } else if (response.status === 403) {
        setError('Forbidden: Admin access required');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to process vehicle delete request');
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
        const result = await response.json();
        if (result.message && result.message.includes('submitted for approval')) {
          alert('Vehicle add request submitted for approval');
        } else {
          // Direct add successful
        }
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

  const handleApproveRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this request?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/vehicles/pending/${requestId}/approve`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Request approved successfully');
        fetchPendingRequests();
        fetchVehicles(); // Refresh vehicles list
      } else {
        const error = await response.json();
        alert('Failed to approve request: ' + error.error);
      }
    } catch (error) {
      alert('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    const reason = prompt('Enter rejection reason (optional):');
    if (reason === null) return; // User cancelled

    try {
      const response = await fetch(`http://localhost:8080/api/vehicles/pending/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
        credentials: 'include'
      });

      if (response.ok) {
        alert('Request rejected successfully');
        fetchPendingRequests();
      } else {
        const error = await response.json();
        alert('Failed to reject request: ' + error.error);
      }
    } catch (error) {
      alert('Failed to reject request');
    }
  };

  const handleEditVehicle = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    // Validate license plate format
    if (!validateLicensePlate(editingVehicle.licensePlate)) {
      setFormError('License plate must be in format: AB 123 (2 letters, space, 3 numbers)');
      setLoading(false);
      return;
    }

    // Validate seating capacity
    if (!validateSeatingCapacity(editingVehicle.seatingCapacity)) {
      setFormError('Seating capacity must be at least 2');
      setLoading(false);
      return;
    }

    const requiredFields = [
      'licensePlate', 'make', 'model', 'year', 'vehicleType', 'color',
      'fuelType', 'transmission', 'seatingCapacity', 'pricePerDay', 'location'
    ];
    const missingFields = requiredFields.filter(field => !editingVehicle[field] || editingVehicle[field].toString().trim() === '');
    if (missingFields.length > 0) {
      setFormError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/vehicles/${editingVehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingVehicle),
        credentials: 'include'
      });
      console.log('Edit vehicle response:', response.status);
      if (response.ok) {
        const updatedVehicle = await response.json();
        setVehicles(vehicles.map(v => v.id === editingVehicle.id ? updatedVehicle : v));
        setShowEditForm(false);
        setEditingVehicle(null);
        setError('');
      } else if (response.status === 401) {
        setFormError('Unauthorized: Please log in as admin');
      } else if (response.status === 403) {
        setFormError('Forbidden: Admin access required');
      } else {
        const errorData = await response.json();
        setFormError(errorData.error || 'Failed to update vehicle');
      }
    } catch (err) {
      setFormError('Failed to connect to the server');
      console.error('Edit vehicle error:', err);
    } finally {
      setLoading(false);
    }
  };

  const VehicleDetailModal = ({ vehicle, onClose }) => {
    if (!vehicle) return null;

    const nextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length);
    };

    const prevImage = () => {
      setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
    };

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content vehicle-detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{vehicle.make} {vehicle.model} ({vehicle.year})</h3>
            <button onClick={onClose} className="close-btn">
              <X size={24} />
            </button>
          </div>

          <div className="vehicle-detail-content">
            <div className="vehicle-images">
              {vehicle.images && vehicle.images.length > 0 ? (
                <div className="image-carousel">
                  <button onClick={prevImage} className="carousel-btn prev">
                    <ChevronLeft size={24} />
                  </button>
                  <img
                    src={`http://localhost:8080/api/vehicles/images/${vehicle.images[currentImageIndex]}`}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="vehicle-image-large"
                  />
                  <button onClick={nextImage} className="carousel-btn next">
                    <ChevronRight size={24} />
                  </button>
                </div>
              ) : (
                <div className="no-image">No images available</div>
              )}
              {vehicle.images && vehicle.images.length > 1 && (
                <div className="image-indicators">
                  {vehicle.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="vehicle-info">
              <div className="info-grid">
                <div className="info-item">
                  <strong>License Plate:</strong> {vehicle.licensePlate}
                </div>
                <div className="info-item">
                  <strong>VIN:</strong> {vehicle.vin || 'N/A'}
                </div>
                <div className="info-item">
                  <strong>Type:</strong> {vehicle.vehicleType}
                </div>
                <div className="info-item">
                  <strong>Color:</strong> {vehicle.color}
                </div>
                <div className="info-item">
                  <strong>Fuel Type:</strong> {vehicle.fuelType}
                </div>
                <div className="info-item">
                  <strong>Transmission:</strong> {vehicle.transmission}
                </div>
                <div className="info-item">
                  <strong>Seating Capacity:</strong> {vehicle.seatingCapacity}
                </div>
                <div className="info-item">
                  <strong>Mileage:</strong> {vehicle.mileage || 'N/A'}
                </div>
                <div className="info-item">
                  <strong>Price per Day:</strong> ${vehicle.pricePerDay}
                </div>
                <div className="info-item">
                  <strong>Location:</strong> {vehicle.location}
                </div>
                <div className="info-item">
                  <strong>Status:</strong>
                  <span className={`status-badge ${vehicle.status.toLowerCase()}`}>
                    {vehicle.status}
                  </span>
                </div>
              </div>

              {vehicle.description && (
                <div className="info-section">
                  <strong>Description:</strong>
                  <p>{vehicle.description}</p>
                </div>
              )}

              {vehicle.features && (
                <div className="info-section">
                  <strong>Features:</strong>
                  <p>{vehicle.features}</p>
                </div>
              )}
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

          <button
            onClick={() => handleNavigation('users')}
            className={`sidebar-btn ${location.pathname === `/${isSuperAdmin() ? 'manager' : 'admin'}/users` ? 'active' : ''}`}
          >
            <Users className="btn-icon" />
            <span>User Management</span>
          </button>
          <button
            onClick={() => handleNavigation('maintenance')}
            className={`sidebar-btn ${location.pathname === `/${isSuperAdmin() ? 'manager' : 'admin'}/maintenance` ? 'active' : ''}`}
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
            {!isSuperAdmin() && (
              <div className="role-info">
                <small>You are logged in as: <strong>{currentAdmin?.role}</strong></small>
                <br />
                <small>Vehicle changes require super admin approval</small>
              </div>
            )}
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              <Plus className="btn-icon" />
              Add Vehicle
            </button>
          </div>

          {isSuperAdmin() && (
            <div className="pending-requests-section">
              <h3>Pending Vehicle Requests</h3>
              {pendingRequests.length === 0 ? (
                <p>No pending requests</p>
              ) : (
                <div className="pending-requests-list">
                  {pendingRequests.map(request => (
                    <div key={request.id} className="pending-request-card">
                      {request.changeType === 'ADD' ? (
                        <div className="pending-vehicle-card">
                          <h4>Pending Vehicle Addition</h4>
                          {(() => {
                            try {
                              const vehicleData = JSON.parse(request.vehicleData);
                              return (
                                <div className="vehicle-details">
                                  <p><strong>Make:</strong> {vehicleData.make}</p>
                                  <p><strong>Model:</strong> {vehicleData.model}</p>
                                  <p><strong>Year:</strong> {vehicleData.year}</p>
                                  <p><strong>License Plate:</strong> {vehicleData.licensePlate}</p>
                                  <p><strong>Type:</strong> {vehicleData.vehicleType}</p>
                                  <p><strong>Color:</strong> {vehicleData.color}</p>
                                  <p><strong>Fuel Type:</strong> {vehicleData.fuelType}</p>
                                  <p><strong>Price/Day:</strong> ${vehicleData.pricePerDay}</p>
                                  <p><strong>Location:</strong> {vehicleData.location}</p>
                                  <p><strong>Requested by:</strong> Admin #{request.requestedBy}</p>
                                  <p><strong>Requested at:</strong> {new Date(request.requestedAt).toLocaleString()}</p>
                                </div>
                              );
                            } catch (e) {
                              return <p>Error parsing vehicle data</p>;
                            }
                          })()}
                        </div>
                      ) : (
                        <div className="request-info">
                          <h4>Pending Vehicle Deletion</h4>
                          <p><strong>Vehicle ID:</strong> {request.vehicleId}</p>
                          <p><strong>Requested by:</strong> Admin #{request.requestedBy}</p>
                          <p><strong>Requested at:</strong> {new Date(request.requestedAt).toLocaleString()}</p>
                        </div>
                      )}
                      <div className="request-actions">
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          className="btn-success"
                        >
                          <Check size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="btn-danger"
                        >
                          <X size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add/Edit Vehicle Form */}
          {(showAddForm || (showEditForm && isSuperAdmin())) && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{showAddForm ? 'Add New Vehicle' : 'Edit Vehicle'}</h3>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setShowEditForm(false);
                      setEditingVehicle(null);
                      setFormError('');
                    }}
                    className="close-btn"
                  >
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={showAddForm ? handleAddVehicle : handleEditVehicle} className="vehicle-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="licensePlate">License Plate *</label>
                      <input
                        type="text"
                        id="licensePlate"
                        name="licensePlate"
                        value={showAddForm ? newVehicle.licensePlate : editingVehicle?.licensePlate || ''}
                        onChange={showAddForm ? handleInputChange : (e) => setEditingVehicle({...editingVehicle, licensePlate: e.target.value})}
                        placeholder="AB 123"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="make">Make *</label>
                      <input
                        type="text"
                        id="make"
                        name="make"
                        value={showAddForm ? newVehicle.make : editingVehicle?.make || ''}
                        onChange={showAddForm ? handleInputChange : (e) => setEditingVehicle({...editingVehicle, make: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="model">Model *</label>
                      <input
                        type="text"
                        id="model"
                        name="model"
                        value={showAddForm ? newVehicle.model : editingVehicle?.model || ''}
                        onChange={showAddForm ? handleInputChange : (e) => setEditingVehicle({...editingVehicle, model: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="year">Year *</label>
                      <input
                        type="number"
                        id="year"
                        name="year"
                        value={showAddForm ? newVehicle.year : editingVehicle?.year || ''}
                        onChange={showAddForm ? handleInputChange : (e) => setEditingVehicle({...editingVehicle, year: e.target.value})}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="vehicleType">Vehicle Type *</label>
                      <select
                        id="vehicleType"
                        name="vehicleType"
                        value={showAddForm ? newVehicle.vehicleType : editingVehicle?.vehicleType || ''}
                        onChange={showAddForm ? handleInputChange : (e) => setEditingVehicle({...editingVehicle, vehicleType: e.target.value})}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Truck">Truck</option>
                        <option value="Van">Van</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Coupe">Coupe</option>
                        <option value="Convertible">Convertible</option>
                        <option value="Wagon">Wagon</option>
                        <option value="Motorcycle">Motorcycle</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="color">Color *</label>
                      <input
                        type="text"
                        id="color"
                        name="color"
                        value={showAddForm ? newVehicle.color : editingVehicle?.color || ''}
                        onChange={showAddForm ? handleInputChange : (e) => setEditingVehicle({...editingVehicle, color: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="fuelType">Fuel Type *</label>
                      <select
                        id="fuelType"
                        name="fuelType"
                        value={showAddForm ? newVehicle.fuelType : editingVehicle?.fuelType || ''}
                        onChange={showAddForm ? handleInputChange : (e) => setEditingVehicle({...editingVehicle, fuelType: e.target.value})}
                        required
                      >
                        <option value="">Select Fuel Type</option>
                        <option value="Gasoline">Gasoline</option>
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
                        value={showAddForm ? newVehicle.transmission : editingVehicle?.transmission || ''}
                        onChange={showAddForm ? handleInputChange : (e) => setEditingVehicle({...editingVehicle, transmission: e.target.value})}
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
                        value={showAddForm ? newVehicle.seatingCapacity : editingVehicle?.seatingCapacity || ''}
                        onChange={showAddForm ? handleInputChange : (e) => setEditingVehicle({...editingVehicle, seatingCapacity: e.target.value})}
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="pricePerDay">Price per Day ($) *</label>
                      <input
                        type="number"
                        id="pricePerDay"
                        name="pricePerDay"
                        value={showAddForm ? newVehicle.pricePerDay : editingVehicle?.pricePerDay || ''}
                        onChange={showAddForm ? handleInputChange : (e) => setEditingVehicle({...editingVehicle, pricePerDay: e.target.value})}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="location">Location *</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={showAddForm ? newVehicle.location : editingVehicle?.location || ''}
                        onChange={showAddForm ? handleInputChange : (e) => setEditingVehicle({...editingVehicle, location: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="vin">VIN</label>
                      <input
                        type="text"
                        id="vin"
                        name="vin"
                        value={showAddForm ? newVehicle.vin : editingVehicle?.vin || ''}
                        onChange={showAddForm ? handleInputChange : (e) => setEditingVehicle({...editingVehicle, vin: e.target.value})}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="mileage">Mileage</label>
                      <input
                        type="number"
                        id="mileage"
                        name="mileage"
                        value={showAddForm ? newVehicle.mileage : editingVehicle?.mileage || ''}
                        onChange={showAddForm ? handleInputChange : (e) => setEditingVehicle({...editingVehicle, mileage: e.target.value})}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={showAddForm ? newVehicle.description : editingVehicle?.description || ''}
                      onChange={showAddForm ? handleInputChange : (e) => setEditingVehicle({...editingVehicle, description: e.target.value})}
                      rows="3"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="features">Features</label>
                    <textarea
                      id="features"
                      name="features"
                      value={showAddForm ? newVehicle.features : editingVehicle?.features || ''}
                      onChange={showAddForm ? handleInputChange : (e) => setEditingVehicle({...editingVehicle, features: e.target.value})}
                      rows="2"
                      placeholder="e.g., Air conditioning, GPS, Bluetooth"
                    />
                  </div>

                  {showAddForm && (
                    <div className="form-group full-width">
                      <label>Vehicle Images * (3 required)</label>
                      <div className="image-upload-grid">
                        <div className="image-upload">
                          <label htmlFor="vehicleImage1">Image 1</label>
                          <input
                            type="file"
                            id="vehicleImage1"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 1)}
                            required
                          />
                        </div>
                        <div className="image-upload">
                          <label htmlFor="vehicleImage2">Image 2</label>
                          <input
                            type="file"
                            id="vehicleImage2"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 2)}
                            required
                          />
                        </div>
                        <div className="image-upload">
                          <label htmlFor="vehicleImage3">Image 3</label>
                          <input
                            type="file"
                            id="vehicleImage3"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 3)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formError && <div className="error-message">{formError}</div>}

                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? 'Processing...' : (showAddForm ? 'Add Vehicle' : 'Update Vehicle')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setShowEditForm(false);
                        setEditingVehicle(null);
                        setFormError('');
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {loading && <div className="loading-message">Loading...</div>}

          {!loading && vehicles.length === 0 && !error && (
            <div className="no-data-message">
              <p>No vehicles found.</p>
            </div>
          )}

          {isSuperAdmin() && vehicles.length > 0 && (
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
                    <th>Edit</th>
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
                      <td data-label="Edit" className="table-edit">
                        <button
                          onClick={() => {
                            setEditingVehicle(vehicle);
                            setShowEditForm(true);
                          }}
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