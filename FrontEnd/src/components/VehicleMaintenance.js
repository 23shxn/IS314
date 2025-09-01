import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Layout, Users, Car, ClipboardList, ToolCase, Plus, Edit, Trash2, FileText } from 'lucide-react';
import '../styles/VehicleMaintenance.css';

const VehicleMaintenance = ({ setCurrentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vehicles, setVehicles] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    vehicle: '',
    fromDate: '',
    toDate: ''
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    carId: '',
    type: '',
    description: '',
    cost: '',
    date: '',
    nextDate: '',
    mechanic: '',
    status: '',
    notes: '',
    mileage: '',
    receipt: null
  });

  useEffect(() => {
    fetchVehicles();
    // For now, we'll use mock data for maintenance records
    // In a real app, you'd fetch this from your API
    setMaintenanceRecords([
      {
        id: 1,
        carId: 1,
        type: 'Routine Service',
        description: 'Oil change and general inspection',
        cost: 150,
        date: '2024-01-15',
        nextDate: '2024-04-15',
        mechanic: 'John\'s Auto Shop',
        status: 'Completed',
        notes: 'All systems checked, no issues found',
        mileage: 45000
      },
      {
        id: 2,
        carId: 2,
        type: 'Repair',
        description: 'Brake pad replacement',
        cost: 300,
        date: '2024-02-20',
        nextDate: '2024-08-20',
        mechanic: 'Smith Auto Repair',
        status: 'Completed',
        notes: 'Front brake pads replaced',
        mileage: 32000
      }
    ]);
  }, []);

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
      if (response.ok) {
        const data = await response.json();
        setVehicles(Array.isArray(data) ? data : []);
        setError('');
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

  // Reset form
  const resetForm = () => {
    setMaintenanceForm({
      carId: '',
      type: '',
      description: '',
      cost: '',
      date: '',
      nextDate: '',
      mechanic: '',
      status: '',
      notes: '',
      mileage: '',
      receipt: null
    });
    setShowForm(false);
    setEditingRecord(null);
  };

  // Submit add/edit form
  const handleSubmit = (e) => {
    e.preventDefault();
    const recordData = {
      ...maintenanceForm,
      id: editingRecord ? editingRecord.id : Date.now(),
      cost: Number(maintenanceForm.cost),
      mileage: Number(maintenanceForm.mileage)
    };
    if (editingRecord) {
      setMaintenanceRecords(maintenanceRecords.map(r => r.id === editingRecord.id ? recordData : r));
      alert('Maintenance record updated!');
    } else {
      setMaintenanceRecords([...maintenanceRecords, recordData]);
      alert('Maintenance record added!');
    }
    resetForm();
  };

  const handleEdit = (record) => {
    setMaintenanceForm(record);
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this maintenance record?')) {
      setMaintenanceRecords(maintenanceRecords.filter(r => r.id !== id));
      alert('Record deleted!');
    }
  };

  // Filter maintenance records
  const filteredRecords = maintenanceRecords.filter(r => {
    const carMatch = !filters.vehicle || r.carId === Number(filters.vehicle);
    const typeMatch = !filters.type || r.type === filters.type;
    const statusMatch = !filters.status || r.status === filters.status;
    const fromDateMatch = !filters.fromDate || new Date(r.date) >= new Date(filters.fromDate);
    const toDateMatch = !filters.toDate || new Date(r.date) <= new Date(filters.toDate);
    return carMatch && typeMatch && statusMatch && fromDateMatch && toDateMatch;
  });

  // Compute needs servicing flag
  const maintenanceWithPriority = filteredRecords.map(record => {
    const vehicle = vehicles.find(v => Number(v.id) === Number(record.carId));
    const lastMileage = record.mileage || 0;
    const currentMileage = vehicle?.mileage || lastMileage;
    const needsService = (currentMileage - lastMileage) >= 5000;
    return {...record, vehicle, needsService};
  });

  // Sort: needs service first, then latest date
  const sortedRecords = maintenanceWithPriority.sort((a, b) => {
    if (a.needsService && !b.needsService) return -1;
    if (!a.needsService && b.needsService) return 1;
    return new Date(b.date) - new Date(a.date);
  });

  // Calculate total maintenance cost per vehicle
  const totalCosts = vehicles.map(vehicle => {
    const total = maintenanceRecords
      .filter(r => Number(r.carId) === vehicle.id)
      .reduce((sum, r) => sum + Number(r.cost), 0);
    return { ...vehicle, totalCost: total };
  });

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
        <div className="maintenance-management">
          <div className="management-header">
            <h2>Vehicle Maintenance Dashboard</h2>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="btn-icon" />
              Add Record
            </button>
          </div>

          {/* Maintenance Form */}
          {showForm && (
            <div className="card maintenance-form-card">
              <h3>{editingRecord ? 'Edit Maintenance Record' : 'Add Maintenance Record'}</h3>
              <form onSubmit={handleSubmit} className="maintenance-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="carId">Vehicle *</label>
                    <select 
                      id="carId"
                      value={maintenanceForm.carId} 
                      onChange={e => setMaintenanceForm({...maintenanceForm, carId: e.target.value})} 
                      className="form-input" 
                      required
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.licensePlate}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="mileage">Current Mileage *</label>
                    <input 
                      type="number" 
                      id="mileage"
                      placeholder="Current Mileage" 
                      value={maintenanceForm.mileage} 
                      onChange={e => setMaintenanceForm({...maintenanceForm, mileage: e.target.value})} 
                      className="form-input" 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="type">Maintenance Type *</label>
                    <select 
                      id="type"
                      value={maintenanceForm.type} 
                      onChange={e => setMaintenanceForm({...maintenanceForm, type: e.target.value})} 
                      className="form-input" 
                      required
                    >
                      <option value="">Maintenance Type</option>
                      <option value="Routine Service">Routine Service</option>
                      <option value="Repair">Repair</option>
                      <option value="Inspection">Inspection</option>
                      <option value="Emergency Repair">Emergency Repair</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="cost">Cost (FJD) *</label>
                    <input 
                      type="number" 
                      id="cost"
                      placeholder="Cost (FJD)" 
                      value={maintenanceForm.cost} 
                      onChange={e => setMaintenanceForm({...maintenanceForm, cost: e.target.value})} 
                      className="form-input" 
                      step="0.01"
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="date">Maintenance Date *</label>
                    <input 
                      type="date" 
                      id="date"
                      value={maintenanceForm.date} 
                      onChange={e => setMaintenanceForm({...maintenanceForm, date: e.target.value})} 
                      className="form-input" 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="nextDate">Next Maintenance Date</label>
                    <input 
                      type="date" 
                      id="nextDate"
                      value={maintenanceForm.nextDate} 
                      onChange={e => setMaintenanceForm({...maintenanceForm, nextDate: e.target.value})} 
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="mechanic">Mechanic / Workshop</label>
                    <input 
                      type="text" 
                      id="mechanic"
                      placeholder="Mechanic / Workshop" 
                      value={maintenanceForm.mechanic} 
                      onChange={e => setMaintenanceForm({...maintenanceForm, mechanic: e.target.value})} 
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Status *</label>
                    <select 
                      id="status"
                      value={maintenanceForm.status} 
                      onChange={e => setMaintenanceForm({...maintenanceForm, status: e.target.value})} 
                      className="form-input" 
                      required
                    >
                      <option value="">Status</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="description">Description *</label>
                    <textarea 
                      id="description"
                      placeholder="Description" 
                      value={maintenanceForm.description} 
                      onChange={e => setMaintenanceForm({...maintenanceForm, description: e.target.value})} 
                      className="form-input" 
                      required 
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="notes">Notes / Observations</label>
                    <textarea 
                      id="notes"
                      placeholder="Notes / Observations" 
                      value={maintenanceForm.notes} 
                      onChange={e => setMaintenanceForm({...maintenanceForm, notes: e.target.value})} 
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="receipt">Receipt</label>
                    <input 
                      type="file" 
                      id="receipt"
                      accept="image/*,application/pdf" 
                      onChange={e => setMaintenanceForm({...maintenanceForm, receipt: e.target.files[0]})} 
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingRecord ? 'Update Record' : 'Add Record'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="card filters-card">
            <h3>Filters</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="filterVehicle">Vehicle:</label>
                <select 
                  id="filterVehicle"
                  value={filters.vehicle} 
                  onChange={e => setFilters({...filters, vehicle: e.target.value})} 
                  className="form-input"
                >
                  <option value="">All Vehicles</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filterType">Type:</label>
                <select 
                  id="filterType"
                  value={filters.type} 
                  onChange={e => setFilters({...filters, type: e.target.value})} 
                  className="form-input"
                >
                  <option value="">All Types</option>
                  <option value="Routine Service">Routine Service</option>
                  <option value="Repair">Repair</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Emergency Repair">Emergency Repair</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filterStatus">Status:</label>
                <select 
                  id="filterStatus"
                  value={filters.status} 
                  onChange={e => setFilters({...filters, status: e.target.value})} 
                  className="form-input"
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filterFromDate">Date From:</label>
                <input 
                  type="date" 
                  id="filterFromDate"
                  value={filters.fromDate} 
                  onChange={e => setFilters({...filters, fromDate: e.target.value})} 
                  className="form-input" 
                />
              </div>

              <div className="filter-group">
                <label htmlFor="filterToDate">Date To:</label>
                <input 
                  type="date" 
                  id="filterToDate"
                  value={filters.toDate} 
                  onChange={e => setFilters({...filters, toDate: e.target.value})} 
                  className="form-input" 
                />
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && <div className="error-message">{error}</div>}
          
          {/* Loading Display */}
          {loading && <div className="loading-message">Loading...</div>}

          {/* Maintenance Records Table */}
          <div className="card">
            <h3>Maintenance Records</h3>
            {sortedRecords.length === 0 ? (
              <p>No maintenance records found.</p>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="table-container">
                  <table className="maintenance-table">
                    <thead>
                      <tr>
                        <th>Vehicle</th>
                        <th>Mileage</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Cost</th>
                        <th>Date</th>
                        <th>Next Maintenance</th>
                        <th>Mechanic</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRecords.map(record => (
                        <tr 
                          key={record.id} 
                          className={`
                            ${record.needsService ? 'needs-service-row' : ''} 
                            ${record.status === 'Overdue' ? 'overdue-row' : ''}
                          `}
                        >
                          <td>
                            {record.vehicle ? 
                              `${record.vehicle.make} ${record.vehicle.model} (${record.vehicle.licensePlate})` : 
                              'Unknown Vehicle'
                            }
                          </td>
                          <td>{record.mileage.toLocaleString()}</td>
                          <td>{record.type}</td>
                          <td>{record.description}</td>
                          <td>${record.cost}</td>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td>{record.nextDate ? new Date(record.nextDate).toLocaleDateString() : '-'}</td>
                          <td>{record.mechanic || '-'}</td>
                          <td>
                            <span className={`status-badge ${record.status.toLowerCase().replace(/\s+/g, '-')}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="table-actions">
                            <button 
                              className="action-btn edit" 
                              onClick={() => handleEdit(record)}
                              title="Edit Record"
                            >
                              <Edit className="action-icon" />
                            </button>
                            <button 
                              className="action-btn delete" 
                              onClick={() => handleDelete(record.id)}
                              title="Delete Record"
                            >
                              <Trash2 className="action-icon" />
                            </button>
                            {record.receipt && (
                              <button 
                                className="action-btn view" 
                                onClick={() => window.open(URL.createObjectURL(record.receipt), '_blank')}
                                title="View Receipt"
                              >
                                <FileText className="action-icon" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="maintenance-cards">
                  {sortedRecords.map(record => (
                    <div 
                      key={record.id} 
                      className={`maintenance-card ${record.needsService ? 'needs-service' : ''} ${record.status === 'Overdue' ? 'overdue' : ''}`}
                    >
                      <div className="card-header">
                        <div className="vehicle-title">
                          {record.vehicle ? 
                            `${record.vehicle.make} ${record.vehicle.model}` : 
                            'Unknown Vehicle'
                          }
                        </div>
                        <span className={`status-badge ${record.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {record.status}
                        </span>
                      </div>
                      
                      <div className="card-content">
                        <div className="card-field">
                          <span className="field-label">License Plate</span>
                          <span className="field-value">{record.vehicle?.licensePlate || 'N/A'}</span>
                        </div>
                        <div className="card-field">
                          <span className="field-label">Mileage</span>
                          <span className="field-value">{record.mileage.toLocaleString()}</span>
                        </div>
                        <div className="card-field">
                          <span className="field-label">Type</span>
                          <span className="field-value">{record.type}</span>
                        </div>
                        <div className="card-field">
                          <span className="field-label">Cost</span>
                          <span className="field-value">${record.cost}</span>
                        </div>
                        <div className="card-field">
                          <span className="field-label">Date</span>
                          <span className="field-value">{new Date(record.date).toLocaleDateString()}</span>
                        </div>
                        <div className="card-field">
                          <span className="field-label">Next Maintenance</span>
                          <span className="field-value">{record.nextDate ? new Date(record.nextDate).toLocaleDateString() : '-'}</span>
                        </div>
                        <div className="card-field">
                          <span className="field-label">Mechanic</span>
                          <span className="field-value">{record.mechanic || '-'}</span>
                        </div>
                        <div className="card-field" style={{gridColumn: '1 / -1'}}>
                          <span className="field-label">Description</span>
                          <span className="field-value">{record.description}</span>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button 
                          className="action-btn edit" 
                          onClick={() => handleEdit(record)}
                          title="Edit Record"
                        >
                          <Edit className="action-icon" />
                        </button>
                        <button 
                          className="action-btn delete" 
                          onClick={() => handleDelete(record.id)}
                          title="Delete Record"
                        >
                          <Trash2 className="action-icon" />
                        </button>
                        {record.receipt && (
                          <button 
                            className="action-btn view" 
                            onClick={() => window.open(URL.createObjectURL(record.receipt), '_blank')}
                            title="View Receipt"
                          >
                            <FileText className="action-icon" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Cost Summary */}
          <div className="card analytics-summary">
            <h3>Maintenance Cost Summary</h3>
            {totalCosts.length === 0 ? (
              <p>No vehicles found.</p>
            ) : (
              <div className="cost-summary-grid">
                {totalCosts.map(vehicle => (
                  <div key={vehicle.id} className="cost-summary-item">
                    <span className="vehicle-info">
                      {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </span>
                    <span className="total-cost">
                      ${vehicle.totalCost.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleMaintenance;