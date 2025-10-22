import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-branding">
          <span className="logo-icon">🚐</span>
          <span className="logo-text">Ronaldo's Rentals</span>
        </div>
        <div className="footer-links">
          <Link to="/about">About Us</Link>
          <Link to="/faqs">FAQs</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/search">Vehicle Search</Link>
        </div>
      </div>
      <div className="footer-copy">
        <p>&copy; {year} Ronaldo's Rentals. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
