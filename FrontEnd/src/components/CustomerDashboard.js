import React from 'react';
import { Calendar, CheckCircle, Clock, Bell } from 'lucide-react';
import '../styles/CustomerDashboard.css';

const CustomerDashboard = ({ currentUser, reservations = [], cars = [] }) => (
    <div className="dashboard-container">
        <div className="dashboard-header">
            <h2>Welcome back, {currentUser?.name || 'Customer'}!</h2>
            <p>Manage your car rentals and reservations</p>
        </div>

        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-content">
                    <Calendar className="stat-icon blue" />
                    <div>
                        <p className="stat-label">Upcoming Rentals</p>
                        <p className="stat-value">{reservations.length}</p>
                    </div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-content">
                    <CheckCircle className="stat-icon green" />
                    <div>
                        <p className="stat-label">Completed Rentals</p>
                        <p className="stat-value">{reservations.filter(r => r.status === 'Completed').length}</p>
                    </div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-content">
                    <Clock className="stat-icon yellow" />
                    <div>
                        <p className="stat-label">Pickup Available</p>
                        <p className="stat-value">{reservations.filter(r => r.status === 'Ready for Pickup').length}</p>
                    </div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-content">
                    <Bell className="stat-icon red" />
                    <div>
                        <p className="stat-label">Notifications</p>
                        <p className="stat-value">0</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="card">
            <h3>Recent Reservations</h3>
            <div className="car-updates">
                {reservations.slice(0, 3).map(reservation => {
                    const car = cars.find(c => c.id === reservation.carId);
                    return (
                        <div key={reservation.id} className="car-update-item">
                            <div>
                                <p className="car-name">
                                    {car 
                                        ? `${car.make} ${car.model}`
                                        : 'Vehicle details unavailable'}
                                </p>
                                <p className="car-location">
                                    {car 
                                        ? car.location 
                                        : 'Location unavailable'}
                                </p>
                            </div>
                            <div className="car-status">
                                <p className={`status ${reservation.status === 'Confirmed' ? 'confirmed' : reservation.status === 'Completed' ? 'completed' : 'pending'}`}>
                                    {reservation.status}
                                </p>
                                <p className="car-date">
                                    {new Date(reservation.rentalDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);

export default CustomerDashboard;