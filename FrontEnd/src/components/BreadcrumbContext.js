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
