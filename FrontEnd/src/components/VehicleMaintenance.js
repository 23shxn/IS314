import React, { useState } from 'react';
import { Plus, Edit, Trash2, Wrench } from 'lucide-react';
import '../styles/VehicleMaintenance.css';

const VehicleMaintenance = ({ cars, maintenanceRecords, setMaintenanceRecords }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [maintenanceForm, setMaintenanceForm] = useState({
    carId: '',
    type: '',
    cost: '',
    date: '',
    description: ''
  });

  const resetForm = () => {
    setMaintenanceForm({
      carId: '',
      type: '',
      cost: '',
      date: '',
      description: ''
    });
    setShowAddForm(false);
    setEditingRecord(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRecord) {
      setMaintenanceRecords(maintenanceRecords.map(r => 
        r.id === editingRecord.id 
          ? { ...maintenanceForm, id: editingRecord.id, cost: Number(maintenanceForm.cost) }
          : r
      ));
      alert('Maintenance record updated successfully!');
    } else {
      const newRecord = {
        ...maintenanceForm,
        id: Date.now(),
        cost: Number(maintenanceForm.cost)
      };
      setMaintenanceRecords([...maintenanceRecords, newRecord]);
      alert('Maintenance record added successfully!');
    }
    resetForm();
  };

  const handleEdit = (record) => {
    setMaintenanceForm(record);
    setEditingRecord(record);
    setShowAddForm(true);
  };

  const handleDelete = (recordId) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      setMaintenanceRecords(maintenanceRecords.filter(r => r.id !== recordId));
      alert('Maintenance record deleted successfully!');
    }
  };

  return (
    <div className="maintenance-container">
      <div className="management-header">
        <h2>Vehicle Maintenance</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          <Plus className="btn-icon" />
          Add Maintenance Record
        </button>
      </div>

      {showAddForm && (
        <div className="card maintenance-form-card">
          <h3>{editingRecord ? 'Edit Maintenance Record' : 'Add Maintenance Record'}</h3>
          <form onSubmit={handleSubmit} className="maintenance-form">
            <select
              className="form-input"
              value={maintenanceForm.carId}
              onChange={(e) => setMaintenanceForm({...maintenanceForm, carId: e.target.value})}
              required
            >
              <option value="">Select Car</option>
              {cars.map(car => (
                <option key={car.id} value={car.id}>{car.make} {car.model}</option>
              ))}
            </select>
            <select
              className="form-input"
              value={maintenanceForm.type}
              onChange={(e) => setMaintenanceForm({...maintenanceForm, type: e.target.value})}
              required
            >
              <option value="">Select Type</option>
              <option value="Routine Service">Routine Service</option>
              <option value="Repair">Repair</option>
              <option value="Inspection">Inspection</option>
            </select>
            <input
              type="number"
              placeholder="Cost (USD)"
              className="form-input"
              value={maintenanceForm.cost}
              onChange={(e) => setMaintenanceForm({...maintenanceForm, cost: e.target.value})}
              required
            />
            <input
              type="date"
              placeholder="Maintenance Date"
              className="form-input"
              value={maintenanceForm.date}
              onChange={(e) => setMaintenanceForm({...maintenanceForm, date: e.target.value})}
              required
            />
            <textarea
              placeholder="Description (e.g., Oil change, tire replacement)"
              className="form-input"
              value={maintenanceForm.description}
              onChange={(e) => setMaintenanceForm({...maintenanceForm, description: e.target.value})}
              required
            />
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingRecord ? 'Update Record' : 'Add Record'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table className="maintenance-table">
            <thead>
              <tr>
                <th>Car</th>
                <th>Type</th>
                <th>Cost</th>
                <th>Date</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceRecords.map(record => {
                const car = cars.find(c => c.id === Number(record.carId));
                return (
                  <tr key={record.id}>
                    <td>{car ? `${car.make} ${car.model}` : 'Unknown'}</td>
                    <td>{record.type}</td>
                    <td>${record.cost}</td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.description}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => handleEdit(record)}
                          className="action-btn edit"
                        >
                          <Edit className="action-icon" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="action-btn delete"
                        >
                          <Trash2 className="action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VehicleMaintenance;