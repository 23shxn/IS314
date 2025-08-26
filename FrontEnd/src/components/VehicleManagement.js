import React, { useState, useEffect } from 'react';
import { Check, X, Plus, Trash2, Eye } from 'lucide-react';
import '../styles/VehicleManagement.css';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingVehicle, setViewingVehicle] = useState(null);
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
    vehicleImage: null
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    console.log('VehicleManagement mounted, fetching vehicles...');
    fetchVehicles();
  }, []);

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
        // Remove the vehicle from the local state
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
    setNewVehicle({ ...newVehicle, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormError('Please upload a valid image file (e.g., JPEG, PNG)');
        return;
      }
      setNewVehicle({ ...newVehicle, vehicleImage: file });
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

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
      if (newVehicle.vehicleImage) formData.append('vehicleImage', newVehicle.vehicleImage);

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
          vehicleImage: null
        });
        document.getElementById('vehicleImage').value = ''; // Reset file input
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

  const VehicleDetailModal = ({ vehicle, onClose }) => {
    if (!vehicle) return null;
    
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{vehicle.make} {vehicle.model} ({vehicle.year})</h3>
            <button onClick={onClose} className="close-btn">&times;</button>
          </div>
          <div className="modal-body">
            {vehicle.vehicleImage && (
              <img
                src={`data:image/jpeg;base64,${vehicle.vehicleImage}`}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="modal-vehicle-image"
              />
            )}
            <div className="vehicle-details-grid">
              <div><strong>License Plate:</strong> {vehicle.licensePlate}</div>
              <div><strong>Type:</strong> {vehicle.vehicleType}</div>
              <div><strong>Color:</strong> {vehicle.color}</div>
              <div><strong>VIN:</strong> {vehicle.vin || 'N/A'}</div>
              <div><strong>Fuel Type:</strong> {vehicle.fuelType}</div>
              <div><strong>Transmission:</strong> {vehicle.transmission}</div>
              <div><strong>Seating:</strong> {vehicle.seatingCapacity} seats</div>
              <div><strong>Mileage:</strong> {vehicle.mileage || 'N/A'} km</div>
              <div><strong>Price:</strong> ${vehicle.pricePerDay}/day</div>
              <div><strong>Location:</strong> {vehicle.location}</div>
              <div><strong>Status:</strong> <span className={`status-badge ${vehicle.status.toLowerCase()}`}>{vehicle.status}</span></div>
            </div>
            {vehicle.description && (
              <div className="description-section">
                <strong>Description:</strong>
                <p>{vehicle.description}</p>
              </div>
            )}
            {vehicle.features && (
              <div className="features-section">
                <strong>Features:</strong>
                <p>{vehicle.features}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  console.log('Rendering VehicleManagement, vehicles:', vehicles, 'showAddForm:', showAddForm);

  return (
    <div className="vehicle-management-container">
      <div className="management-header">
        <h2>Vehicle Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="action-btn add-vehicle"
          disabled={loading}
        >
          <Plus className="action-icon" /> {showAddForm ? 'Cancel' : 'Add Vehicle'}
        </button>
      </div>

      {showAddForm && (
        <div className="card add-vehicle-form">
          <h3>Add New Vehicle</h3>
          {formError && <p className="error-text">{formError}</p>}
          <form onSubmit={handleAddVehicle}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="licensePlate">License Plate *</label>
                <input
                  type="text"
                  id="licensePlate"
                  name="licensePlate"
                  value={newVehicle.licensePlate}
                  onChange={handleInputChange}
                  placeholder="Enter license plate"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="make">Make *</label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  value={newVehicle.make}
                  onChange={handleInputChange}
                  placeholder="Enter make"
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
                  placeholder="Enter model"
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
                  placeholder="Enter year"
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
                  <option value="">Select vehicle type</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
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
                  placeholder="Enter color"
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
                  placeholder="Enter VIN"
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
                  <option value="">Select fuel type</option>
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
                  <option value="">Select transmission</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
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
                  placeholder="Enter seating capacity"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="mileage">Mileage</label>
                <input
                  type="number"
                  id="mileage"
                  name="mileage"
                  value={newVehicle.mileage}
                  onChange={handleInputChange}
                  placeholder="Enter mileage"
                />
              </div>
              <div className="form-group">
                <label htmlFor="pricePerDay">Price Per Day *</label>
                <input
                  type="number"
                  id="pricePerDay"
                  name="pricePerDay"
                  value={newVehicle.pricePerDay}
                  onChange={handleInputChange}
                  placeholder="Enter price per day"
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
                  <option value="">Select location</option>
                  <option value="Suva">Suva</option>
                  <option value="Nadi">Nadi</option>
                  <option value="Lautoka">Lautoka</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newVehicle.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                />
              </div>
              <div className="form-group full-width">
                <label htmlFor="features">Features</label>
                <textarea
                  id="features"
                  name="features"
                  value={newVehicle.features}
                  onChange={handleInputChange}
                  placeholder="Enter features (e.g., AC, GPS)"
                />
              </div>
              <div className="form-group full-width">
                <label htmlFor="vehicleImage">Vehicle Image</label>
                <input
                  type="file"
                  id="vehicleImage"
                  name="vehicleImage"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>
            <button type="submit" className="action-btn submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Vehicle'}
            </button>
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
                    <button
                      onClick={() => setViewingVehicle(vehicle)}
                      className="action-btn view"
                      title="View Details"
                    >
                      <Eye className="action-icon" />
                    </button>
                    
                    <select
                      value={vehicle.status}
                      onChange={(e) => handleStatusUpdate(vehicle.id, e.target.value)}
                      className="status-select"
                      disabled={loading}
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
                      <Trash2 className="action-icon" />
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
  );
};

export default VehicleManagement;