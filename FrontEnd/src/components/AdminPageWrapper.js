import React from 'react';
import Breadcrumbs from './Breadcrumbs';

const AdminPageWrapper = ({ children }) => (
  <div className="admin-page">
    <Breadcrumbs />
    <div className="admin-content">
      {children}
    </div>
  </div>
);

export default AdminPageWrapper;
