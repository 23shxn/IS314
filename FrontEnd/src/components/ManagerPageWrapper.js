import React from 'react';
import Breadcrumbs from './Breadcrumbs';

const ManagerPageWrapper = ({ children }) => (
  <div className="manager-page">
    <Breadcrumbs />
    <div className="manager-content">
      {children}
    </div>
  </div>
);

export default ManagerPageWrapper;
