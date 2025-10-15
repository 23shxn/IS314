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
import SuperAdminDashboardManager from './components/SuperAdminDashboardManager';
import UserManagementManager from './components/UserManagementManager';
import VehicleManagementManager from './components/VehicleManagementManager';
import VehicleManagement from './components/VehicleManagement';
import VehicleMaintenance from './components/VehicleMaintenance';
import VehicleMaintenanceManager from './components/VehicleMaintenanceManager';
import PendingRequests from './components/PendingRequests';
import UserManagement from './components/UserManagement';
import LandingPage from './components/LandingPage';
import AboutUs from './components/AboutUs';
import FAQs from './components/FAQs';
import Contact from './components/Contact';
import CompleteBooking from './components/CompleteBooking';
import CarDetail from './components/CarDetail';
import Checkout from './components/Checkout';
import Cancellation from './components/Cancellation';
import AllReservations from './components/AllReservations';

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
        if (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') {
          try {
            const fetchPromises = [
              fetch(`${process.env.REACT_APP_API_URL}/api/vehicles/all`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
              }),
              fetch(`${process.env.REACT_APP_API_URL}/api/auth/users/customers`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
              }),
              fetch(`${process.env.REACT_APP_API_URL}/api/auth/requests/pending`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
              }),
              fetch(`${process.env.REACT_APP_API_URL}/api/reservations/all`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
              })
            ];

            const [vehiclesRes, usersRes, pendingRes, reservationsRes] = await Promise.all(fetchPromises);

            const vehiclesData = await vehiclesRes.json();
            const usersData = await usersRes.json();
            const pendingData = await pendingRes.json();
            const reservationsData = await reservationsRes.json();

            if (vehiclesRes.ok) setCars(Array.isArray(vehiclesData) ? vehiclesData : []);
            if (usersRes.ok) setUsers(Array.isArray(usersData) ? usersData : []);
            if (pendingRes.ok) setPendingRequests(Array.isArray(pendingData) ? pendingData : []);
            if (reservationsRes.ok) setReservations(Array.isArray(reservationsData) ? reservationsData : []);
          } catch (error) {
            console.error('Failed to fetch initial data:', error);
          }
        } else if (currentUser?.role === 'customer') {
      try {
        const [vehiclesRes, reservationsRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/api/vehicles/available`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          }),
          fetch(`${process.env.REACT_APP_API_URL}/api/reservations/user/${currentUser.id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          })
        ]);

        const vehiclesData = await vehiclesRes.json();
        const reservationsData = await reservationsRes.json();

        if (vehiclesRes.ok) setCars(Array.isArray(vehiclesData) ? vehiclesData : []);
        if (reservationsRes.ok) setReservations(Array.isArray(reservationsData) ? reservationsData : []);
      } catch (error) {
        console.error('Failed to fetch data for customer:', error);
      }
    }
  };

  // Component to protect admin routes
  const AdminRoute = ({ children, setCurrentUser }) => {
    if (!currentUser) {
      return <Navigate to="/admin/login" replace />;
    }
    if (currentUser.role !== 'ADMIN') {
      return <Navigate to="/admin/login" replace />;
    }
    return React.cloneElement(children, { currentUser, setCurrentUser, cars, users, pendingRequests });
  };

  // Component to protect super admin routes
  const SuperAdminRoute = ({ children, setCurrentUser }) => {
    if (!currentUser) {
      return <Navigate to="/admin/login" replace />;
    }
    if (currentUser.role !== 'SUPER_ADMIN') {
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
    if (currentUser.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (currentUser.role === 'SUPER_ADMIN') {
      return <Navigate to="/manager/dashboard" replace />;
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
          <Route path="/home" element={<LandingPage currentUser={currentUser} />} />
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
            path="/cancel/:id" 
            element={
              <CustomerRoute>
                <Cancellation 
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

          {/* Manager (Super Admin) Protected Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <SuperAdminRoute setCurrentUser={setCurrentUser}>
                <SuperAdminDashboardManager
                  currentUser={currentUser}
                  cars={cars}
                  reservations={reservations}
                  users={users}
                  pendingRequests={pendingRequests}
                />
              </SuperAdminRoute>
            }
          />
          <Route
            path="/manager/vehicles"
            element={
              <SuperAdminRoute setCurrentUser={setCurrentUser}>
                <VehicleManagementManager />
              </SuperAdminRoute>
            }
          />
          <Route
            path="/manager/maintenance"
            element={
              <SuperAdminRoute setCurrentUser={setCurrentUser}>
                <VehicleMaintenanceManager
                  cars={cars}
                  maintenanceRecords={maintenanceRecords}
                  setMaintenanceRecords={setMaintenanceRecords}
                />
              </SuperAdminRoute>
            }
          />
          <Route
            path="/manager/pending-requests"
            element={
              <SuperAdminRoute setCurrentUser={setCurrentUser}>
                <PendingRequests />
              </SuperAdminRoute>
            }
          />
          <Route
            path="/manager/users"
            element={
              <SuperAdminRoute setCurrentUser={setCurrentUser}>
                <UserManagementManager />
              </SuperAdminRoute>
            }
          />
          <Route
            path="/manager/reservations"
            element={
              <SuperAdminRoute setCurrentUser={setCurrentUser}>
                <AllReservations
                  reservations={reservations}
                  setReservations={setReservations}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  role="SUPER_ADMIN"
                  cars={cars}
                />
              </SuperAdminRoute>
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
            path="/admin/reservations"
            element={
              <AdminRoute setCurrentUser={setCurrentUser}>
                <AllReservations
                  reservations={reservations}
                  setReservations={setReservations}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  role="ADMIN"
                  cars={cars}
                />
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
              currentUser?.role === 'ADMIN' ?
                <Navigate to="/admin/dashboard" replace /> :
                currentUser?.role === 'SUPER_ADMIN' ?
                  <Navigate to="/manager/dashboard" replace /> :
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
