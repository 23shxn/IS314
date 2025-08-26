import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Car, Bell, User, LogOut } from 'lucide-react';
import '../styles/Navigation.css';

const Navigation = ({ currentUser, setCurrentUser }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Car className="nav-icon" />
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>Ronaldo's Rentals</h1>
          </Link>
        </div>

        <div className="nav-menu">
          {currentUser?.role === 'admin' ? (
            <>
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link
                to="/admin/dashboard"
                className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
              >
                Pending Requests
              </Link>
              <Link
                to="/admin/vehicles"
                className={`nav-link ${isActive('/admin/vehicles') ? 'active' : ''}`}
              >
                Vehicle Management
              </Link>
              <Link
                to="/admin/maintenance"
                className={`nav-link ${isActive('/admin/maintenance') ? 'active' : ''}`}
              >
                Maintenance
              </Link>
            </>
          ) : currentUser?.role === 'customer' ? (
            <>
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                to="/search"
                className={`nav-link ${isActive('/search') ? 'active' : ''}`}
              >
                Search Cars
              </Link>
              <Link
                to="/reservations"
                className={`nav-link ${isActive('/reservations') ? 'active' : ''}`}
              >
                My Reservations
              </Link>
              <Link
                to="/pickup"
                className={`nav-link ${isActive('/pickup') ? 'active' : ''}`}
              >
                Pickup
              </Link>
            </>
          ) : (
            // Show basic navigation for non-logged in users
            <>
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link
                to="/login"
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
              >
                Login
              </Link>
            </>
          )}

          {currentUser && (
            <div className="nav-user">
              <Bell className="nav-icon-small" />
              <User className="nav-icon-small" />
              <span>{currentUser?.name}</span>
              <button
                onClick={handleLogout}
                className="logout-button"
              >
                <LogOut className="nav-icon-small" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;