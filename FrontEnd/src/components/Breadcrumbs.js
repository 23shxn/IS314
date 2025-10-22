import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBreadcrumbs } from './BreadcrumbContext';
import '../styles/Breadcrumbs.css';

const Breadcrumbs = () => {
  const location = useLocation();
  const { breadcrumbHistory } = useBreadcrumbs();

  // Don't render breadcrumbs on login pages
  if (location.pathname === '/login' || location.pathname === '/admin/login') {
    return null;
  }

  // Define route-to-label mapping
  const routeLabels = {
    '/': 'Home',
    '/home': 'Home',
    '/about': 'About Us',
    '/faqs': 'FAQs',
    '/contact': 'Contact',
    '/search': 'Search Cars',
    '/dashboard': 'Dashboard',
    '/complete-booking': 'Complete Booking',
    '/reservations': 'My Reservations',
    '/cancel': 'Cancel Reservation',
    '/pickup': 'Pickup',
    '/car-detail': 'Car Details',
    '/checkout': 'Checkout',
    '/admin/dashboard': 'Admin Dashboard',
    '/admin/vehicles': 'Vehicle Management',
    '/admin/maintenance': 'Vehicle Maintenance',
    '/admin/pending-requests': 'Pending Requests',
    '/admin/reservations': 'All Reservations',
    '/admin/users': 'User Management',
    '/manager/dashboard': 'Manager Dashboard',
    '/manager/vehicles': 'Vehicle Management',
    '/manager/vehicles/add': 'Add Vehicle',
    '/manager/vehicles/edit': 'Edit Vehicle',
    '/manager/maintenance': 'Vehicle Maintenance',
    '/manager/pending-requests': 'Pending Requests',
    '/manager/users': 'User Management',
    '/manager/reservations': 'All Reservations'
  };

  // Generate breadcrumb segments based on history
  const generateBreadcrumbs = () => {
    const breadcrumbs = [];
    breadcrumbHistory.forEach(path => {
      if (routeLabels[path]) {
        breadcrumbs.push({ path, label: routeLabels[path] });
      }
    });
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav aria-label="breadcrumb" className="breadcrumbs">
      <ol className="breadcrumb-list">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="breadcrumb-item">
            {index < breadcrumbs.length - 1 ? (
              <>
                <Link to={crumb.path} className="breadcrumb-link">
                  {crumb.label}
                </Link>
                <span className="breadcrumb-separator">{'>'}</span>
              </>
            ) : (
              <span className="breadcrumb-current">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;