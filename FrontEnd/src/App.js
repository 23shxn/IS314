import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { 
  User, 
  Car, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Search, 
  Settings, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Bell,
  CreditCard,
  Users
} from 'lucide-react';
import './styles/Global.css';
import LoginForm from './components/LoginForm';
import AdminLogin from './components/AdminLogin';
import Navigation from './components/Navigation';
import CustomerDashboard from './components/CustomerDashboard';
import VehicleSearch from './components/VehicleSearch';
import ReservationManagement from './components/ReservationManagement';
import AdminDashboard from './components/AdminDashboard';
import VehicleManagement from './components/VehicleManagement';
import VehicleMaintenance from './components/VehicleMaintenance';
import PendingRequests from './components/PendingRequests';
import UserManagement from './components/UserManagement';
import LandingPage from './components/LandingPage';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [cars, setCars] = useState([
    {
      id: 1,
      make: 'Toyota',
      model: 'Camry',
      type: 'Sedan',
      year: 2023,
      location: 'Suva',
      rentalDate: '2025-08-05',
      pricePerDay: 50,
      status: 'Available',
      image: '/images/camry.jpeg.avif'
    },
    {
      id: 2,
      make: 'Honda',
      model: 'Civic',
      type: 'Compact',
      year: 2022,
      location: 'Lautoka',
      rentalDate: '2025-08-06',
      pricePerDay: 45,
      status: 'Rented',
      image: 'images/civic.jpeg.png'
    }
  ]);
  const [reservations, setReservations] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@admin.com', role: 'admin' }
  ]);
  const [searchParams, setSearchParams] = useState({
    location: '',
    type: '',
    priceRange: '',
    startDate: ''
  });

  useEffect(() => {
    console.log('App - currentUser:', currentUser);
  }, [currentUser]);

  // Component to protect admin routes
  const AdminRoute = ({ children }) => {
    // If no user is logged in, redirect to admin login
    if (!currentUser) {
      return <Navigate to="/admin/login" replace />;
    }
    
    // If user is logged in but not admin, redirect to admin login
    if (currentUser.role !== 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    
    // User is admin, render the protected content
    return children;
  };

  // Component to protect customer routes
  const CustomerRoute = ({ children }) => {
    // If no user is logged in, redirect to customer login
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    
    // If user is logged in but not customer, redirect to customer login
    if (currentUser.role !== 'customer') {
      return <Navigate to="/login" replace />;
    }
    
    // User is customer, render the protected content
    return children;
  };

  // Component to redirect logged-in users away from login pages
  const PublicRoute = ({ children }) => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
      if (currentUser.role === 'customer') {
        return <Navigate to="/dashboard" replace />;
      }
    }
    return children;
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Navigation 
          currentUser={currentUser} 
          setCurrentUser={setCurrentUser} 
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage currentUser={currentUser} />} />
          
          {/* Login Routes - redirect if already logged in */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginForm setCurrentUser={setCurrentUser} />
              </PublicRoute>
            } 
          />
          <Route 
            path="/admin/login" 
            element={
              <PublicRoute>
                <AdminLogin setCurrentUser={setCurrentUser} />
              </PublicRoute>
            } 
          />

          {/* Customer Routes */}
          <Route 
            path="/dashboard" 
            element={
              <CustomerRoute>
                <CustomerDashboard 
                  currentUser={currentUser} 
                  reservations={reservations} 
                  cars={cars} 
                />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/search" 
            element={
              <VehicleSearch 
                cars={cars} 
                searchParams={searchParams} 
                setSearchParams={setSearchParams} 
                reservations={reservations} 
                setReservations={setReservations} 
                currentUser={currentUser}
              />
            } 
          />
          <Route 
            path="/reservations" 
            element={
              <CustomerRoute>
                <ReservationManagement 
                  reservations={reservations} 
                  setReservations={setReservations} 
                  currentUser={currentUser}
                />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/pickup" 
            element={
              <CustomerRoute>
                <div>Pickup functionality to be implemented</div>
              </CustomerRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <AdminDashboard 
                  currentUser={currentUser} 
                  cars={cars} 
                  reservations={reservations} 
                  users={users} 
                />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/vehicles" 
            element={
              <AdminRoute>
                <VehicleManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/maintenance" 
            element={
              <AdminRoute>
                <VehicleMaintenance
                  cars={cars}
                  maintenanceRecords={maintenanceRecords}
                  setMaintenanceRecords={setMaintenanceRecords}
                />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/pending-requests" 
            element={
              <AdminRoute>
                <PendingRequests />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            } 
          />

          {/* Catch-all route - redirect to appropriate default page */}
          <Route 
            path="*" 
            element={
              currentUser?.role === 'admin' ? 
                <Navigate to="/admin/dashboard" replace /> : 
                currentUser?.role === 'customer' ? 
                  <Navigate to="/dashboard" replace /> : 
                  <Navigate to="/" replace />
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;