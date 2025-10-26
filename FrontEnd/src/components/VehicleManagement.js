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
  const [viewingVehicle, setViewingVehicle] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
            <button onClick={() => navigate('/admin/vehicles/add')} className="btn-primary">
              <Plus size={16} /> Submit Vehicle Request
            </button>
          </div>



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