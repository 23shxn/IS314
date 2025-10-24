import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Car, User, LogOut } from 'lucide-react';
import '../styles/Navigation.css';

const Navigation = ({ currentUser, setCurrentUser }) => {
  const location = useLocation();
  const navigate = useNavigate();

  
  if (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' ||
      location.pathname.startsWith('/admin') || location.pathname.startsWith('/manager') ||
      location.pathname === '/login' || location.pathname === '/admin/login') {
    return null;
  }

  const handleLogout = () => {
    console.log('Logging out, setting currentUser to null');
    setCurrentUser(null); 
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || (path === '/home' && location.pathname === '/');
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
          {currentUser?.role === 'customer' ? (
            <>
              <Link
                to="/home"
                className={`nav-link ${isActive('/home') ? 'active' : ''}`}
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
            </>
          ) : (
         
            <>
              <Link
                to="/home"
                className={`nav-link ${isActive('/home') ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`nav-link ${isActive('/about') ? 'active' : ''}`}
              >
                About Us
              </Link>
              <Link
                to="/faqs"
                className={`nav-link ${isActive('/faqs') ? 'active' : ''}`}
              >
                FAQS
              </Link>
              <Link
                to="/contact"
                className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
              >
                Contact
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