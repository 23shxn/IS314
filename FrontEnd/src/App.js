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
import AboutUs from './components/AboutUs';
import FAQs from './components/FAQs';
import Contact from './components/Contact';
import CompleteBooking from './components/CompleteBooking';
import CarDetail from './components/CarDetail';
import Checkout from './components/Checkout';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchParams, setSearchParams] = useState({
    location: '',
    type: '',
    priceRange: '',
    startDate: ''
  });

  useEffect(() => {
    console.log('App - currentUser:', currentUser);
    fetchInitialData();
  }, [currentUser]);

  const fetchInitialData = async () => {
    if (currentUser?.role === 'admin') {
      try {
        const [vehiclesRes, usersRes, pendingRes] = await Promise.all([
          fetch('http://localhost:8080/api/vehicles/all', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          }),
          fetch('http://localhost:8080/api/auth/users/customers', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          }),
          fetch('http://localhost:8080/api/auth/requests/pending', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          })
        ]);

        const vehiclesData = await vehiclesRes.json();
        const usersData = await usersRes.json();
        const pendingData = await pendingRes.json();

        if (vehiclesRes.ok) setCars(Array.isArray(vehiclesData) ? vehiclesData : []);
        if (usersRes.ok) setUsers(Array.isArray(usersData) ? usersData : []);
        if (pendingRes.ok) setPendingRequests(Array.isArray(pendingData) ? pendingData : []);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    }
  };

  // Component to protect admin routes
  const AdminRoute = ({ children, setCurrentUser }) => {
    if (!currentUser) {
      return <Navigate to="/admin/login" replace />;
    }
    if (currentUser.role !== 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    return React.cloneElement(children, { currentUser, setCurrentUser, cars, users, pendingRequests });
  };

  // Component to protect customer routes
  const CustomerRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    if (currentUser.role !== 'customer') {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Component to redirect logged-in users away from login pages
  const PublicRoute = ({ children }) => {
    if (!currentUser) {
      return children;
    }
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (currentUser.role === 'customer') {
      return <Navigate to="/dashboard" replace />;
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
          {/* Public Routes - Available to everyone */}
          <Route path="/" element={<LandingPage currentUser={currentUser} />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/contact" element={<Contact />} />
          
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

          {/* Vehicle Search - Available to both logged in and non-logged in users */}
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

          {/* Customer Protected Routes */}
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
            path="/complete-booking" 
            element={
              <CustomerRoute>
                <CompleteBooking 
                  reservations={reservations} 
                  setReservations={setReservations} 
                  currentUser={currentUser}
                />
              </CustomerRoute>
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
          <Route  
            path="/car-detail" 
            element={
              <CustomerRoute>
                <CarDetail
                  reservations={reservations} 
                  setReservations={setReservations} 
                  currentUser={currentUser}
                />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <Checkout 
                reservations={reservations} 
                setReservations={setReservations} 
                currentUser={currentUser} 
              />
            } 
          />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute setCurrentUser={setCurrentUser}>
                <AdminDashboard 
                  currentUser={currentUser} 
                  cars={cars} 
                  reservations={reservations} 
                  users={users} 
                  pendingRequests={pendingRequests}
                />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/vehicles" 
            element={
              <AdminRoute setCurrentUser={setCurrentUser}>
                <VehicleManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/maintenance" 
            element={
              <AdminRoute setCurrentUser={setCurrentUser}>
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
              <AdminRoute setCurrentUser={setCurrentUser}>
                <PendingRequests />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute setCurrentUser={setCurrentUser}>
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