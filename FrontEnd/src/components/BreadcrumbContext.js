import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BreadcrumbContext = createContext();

export const useBreadcrumbs = () => useContext(BreadcrumbContext);

export const BreadcrumbProvider = ({ children }) => {
  const [breadcrumbHistory, setBreadcrumbHistory] = useState(['/']);
  const location = useLocation();

  useEffect(() => {
    setBreadcrumbHistory(prev => {
      const last = prev[prev.length - 1];
      if (location.pathname === last) return prev;

      // For admin and manager pages, start from their respective dashboards
      if (location.pathname.startsWith('/admin/')) {
        if (location.pathname === '/admin/dashboard') return ['/admin/dashboard'];
        const index = prev.indexOf(location.pathname);
        if (index !== -1) {
          return prev.slice(0, index + 1);
        }
        // If not in history, start from dashboard
        return ['/admin/dashboard', location.pathname];
      }

      if (location.pathname.startsWith('/manager/')) {
        if (location.pathname === '/manager/dashboard') return ['/manager/dashboard'];
        const index = prev.indexOf(location.pathname);
        if (index !== -1) {
          return prev.slice(0, index + 1);
        }
        // If not in history, build breadcrumb trail based on navigation path
        let trail = ['/manager/dashboard'];
        if (location.pathname === '/manager/vehicles') {
          trail.push('/manager/vehicles');
        } else if (location.pathname === '/manager/vehicles/add') {
          trail.push('/manager/vehicles', '/manager/vehicles/add');
        } else if (location.pathname === '/manager/maintenance') {
          trail.push('/manager/maintenance');
        } else if (location.pathname === '/manager/pending-requests') {
          trail.push('/manager/pending-requests');
        } else if (location.pathname === '/manager/users') {
          trail.push('/manager/users');
        } else if (location.pathname === '/manager/reservations') {
          trail.push('/manager/reservations');
        } else {
          trail.push(location.pathname);
        }
        return trail;
      }

      if (location.pathname === '/') return ['/'];
      // If navigating to a previous page, truncate history
      const index = prev.indexOf(location.pathname);
      if (index !== -1) {
        return prev.slice(0, index + 1);
      }
      // Otherwise, add new page to history
      return [...prev, location.pathname];
    });
  }, [location.pathname]);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbHistory }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};
